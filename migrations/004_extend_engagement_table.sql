-- Migration: Extend engagement table with comprehensive engagement management fields
-- Date: 2025-08-22
-- Purpose: Add all fields needed for comprehensive engagement management system

-- First, add missing enum values if needed
DO $$ BEGIN
    -- Add sales type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_type_enum') THEN
        CREATE TYPE sales_type_enum AS ENUM ('Channel', 'Direct Sell', 'Greaser Sale');
    END IF;
    
    -- Add speed enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'speed_enum') THEN
        CREATE TYPE speed_enum AS ENUM ('Slow', 'Medium', 'Fast');
    END IF;
    
    -- Add CRM enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_enum') THEN
        CREATE TYPE crm_enum AS ENUM ('Salesforce', 'Dynamics', 'Hubspot', 'Other', 'None');
    END IF;
    
    -- Add add-on enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'addon_enum') THEN
        CREATE TYPE addon_enum AS ENUM ('Meet', 'Deal', 'Forecasting', 'AI Agents', 'Content', 'Migration', 'Managed Services');
    END IF;
END $$;

-- Add new columns to engagement table
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS account_name TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS assigned_rep TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS close_date DATE;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS sales_type sales_type_enum;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS speed speed_enum;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS crm crm_enum;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS avaza_link TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS project_folder_link TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS client_website_link TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS sold_by TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS seat_count INTEGER;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS hours_allocated INTEGER;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS linkedin_link TEXT;
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS add_ons_purchased addon_enum[];

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_engagement_assigned_rep ON engagement(assigned_rep);
CREATE INDEX IF NOT EXISTS idx_engagement_account_name ON engagement(account_name);
CREATE INDEX IF NOT EXISTS idx_engagement_sales_type ON engagement(sales_type);
CREATE INDEX IF NOT EXISTS idx_engagement_speed ON engagement(speed);
CREATE INDEX IF NOT EXISTS idx_engagement_close_date ON engagement(close_date);

-- Update the view to include new fields
DROP VIEW IF EXISTS vw_engagement_progress;
CREATE OR REPLACE VIEW vw_engagement_progress AS
SELECT
  e.id AS engagement_id,
  e.name,
  e.account_name,
  e.status,
  e.health,
  e.assigned_rep,
  e.start_date,
  e.close_date,
  e.sales_type,
  e.speed,
  e.crm,
  e.priority,
  e.seat_count,
  e.hours_allocated,
  COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED')::decimal / NULLIF(COUNT(em.id),0) AS fraction_complete,
  ROUND(100 * COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED')::decimal / NULLIF(COUNT(em.id),0), 1) AS percent_complete,
  e.created_at,
  e.updated_at
FROM engagement e
LEFT JOIN engagement_milestone em ON em.engagement_id = e.id
GROUP BY e.id, e.name, e.account_name, e.status, e.health, e.assigned_rep, 
         e.start_date, e.close_date, e.sales_type, e.speed, e.crm, e.priority,
         e.seat_count, e.hours_allocated, e.created_at, e.updated_at;

-- Create function to get all available reps
CREATE OR REPLACE FUNCTION get_available_reps()
RETURNS TABLE(rep_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT au.name
  FROM app_user au
  WHERE au.role IN ('REP', 'MANAGER')
  ORDER BY au.name;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data if engagement table is empty
INSERT INTO account (id, name, segment, region) VALUES
  (uuid_generate_v4(), 'TechCorp Solutions', 'Enterprise', 'North America'),
  (uuid_generate_v4(), 'Global Manufacturing Inc', 'Enterprise', 'Europe'),
  (uuid_generate_v4(), 'StartupFlow', 'SMB', 'North America')
ON CONFLICT DO NOTHING;

-- Insert sample users if needed
INSERT INTO app_user (id, name, email, role) VALUES
  (uuid_generate_v4(), 'Dakota', 'dakota@company.com', 'REP'),
  (uuid_generate_v4(), 'Chris', 'chris@company.com', 'MANAGER'),
  (uuid_generate_v4(), 'Amanda', 'amanda@company.com', 'REP'),
  (uuid_generate_v4(), 'Rolando', 'rolando@company.com', 'REP'),
  (uuid_generate_v4(), 'Lisa', 'lisa@company.com', 'REP'),
  (uuid_generate_v4(), 'Steph', 'steph@company.com', 'REP'),
  (uuid_generate_v4(), 'Josh', 'josh@company.com', 'REP')
ON CONFLICT (email) DO NOTHING;

-- Insert sample engagements if engagement table is empty
DO $$
DECLARE
  tech_account_id UUID;
  manufacturing_account_id UUID;
  startup_account_id UUID;
  rolando_user_id UUID;
  amanda_user_id UUID;
  lisa_user_id UUID;
BEGIN
  -- Get account IDs
  SELECT id INTO tech_account_id FROM account WHERE name = 'TechCorp Solutions' LIMIT 1;
  SELECT id INTO manufacturing_account_id FROM account WHERE name = 'Global Manufacturing Inc' LIMIT 1;
  SELECT id INTO startup_account_id FROM account WHERE name = 'StartupFlow' LIMIT 1;
  
  -- Get user IDs
  SELECT id INTO rolando_user_id FROM app_user WHERE name = 'Rolando' LIMIT 1;
  SELECT id INTO amanda_user_id FROM app_user WHERE name = 'Amanda' LIMIT 1;
  SELECT id INTO lisa_user_id FROM app_user WHERE name = 'Lisa' LIMIT 1;
  
  -- Only insert if engagement table is empty
  IF NOT EXISTS (SELECT 1 FROM engagement LIMIT 1) THEN
    INSERT INTO engagement (
      id, account_id, owner_user_id, name, account_name, status, health, assigned_rep,
      start_date, close_date, target_launch_date, sales_type, speed, crm,
      sold_by, seat_count, hours_allocated, primary_contact_name, 
      primary_contact_email, linkedin_link, avaza_link, project_folder_link,
      client_website_link, add_ons_purchased, priority
    ) VALUES
    (
      uuid_generate_v4(), tech_account_id, rolando_user_id,
      'Digital Transformation Initiative', 'TechCorp Solutions',
      'IN_PROGRESS', 'GREEN', 'Rolando',
      '2024-01-15', '2024-06-30', '2024-06-30',
      'Direct Sell', 'Fast', 'Salesforce',
      'Chris', 50, 120, 'John Smith',
      'john@techcorp.com', 'https://linkedin.com/in/johnsmith',
      'https://avaza.com/project/001', 'https://drive.google.com/folder1',
      'https://techcorp.com', ARRAY['Meet', 'Deal']::addon_enum[], 2
    ),
    (
      uuid_generate_v4(), manufacturing_account_id, amanda_user_id,
      'Cloud Migration Project', 'Global Manufacturing Inc',
      'KICK_OFF', 'YELLOW', 'Amanda',
      '2024-02-01', '2024-08-15', '2024-08-15',
      'Channel', 'Medium', 'Dynamics',
      'Dakota', 25, 80, 'Sarah Johnson',
      'sarah@globalmanuf.com', NULL,
      NULL, NULL, NULL,
      ARRAY['Forecasting', 'Migration']::addon_enum[], 3
    ),
    (
      uuid_generate_v4(), startup_account_id, lisa_user_id,
      'Customer Portal Redesign', 'StartupFlow',
      'NEW', 'GREEN', 'Lisa',
      '2024-03-01', '2024-07-01', '2024-07-01',
      'Greaser Sale', 'Slow', 'Hubspot',
      'Steph', 10, 40, 'Mike Chen',
      'mike@startupflow.com', NULL,
      NULL, NULL, NULL,
      ARRAY['Content']::addon_enum[], 4
    );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN engagement.account_name IS 'Account name for quick access without joins';
COMMENT ON COLUMN engagement.assigned_rep IS 'Name of assigned representative';
COMMENT ON COLUMN engagement.close_date IS 'Expected or actual close date';
COMMENT ON COLUMN engagement.sales_type IS 'Type of sale: Channel, Direct Sell, or Greaser Sale';
COMMENT ON COLUMN engagement.speed IS 'Project speed: Slow, Medium, or Fast';
COMMENT ON COLUMN engagement.crm IS 'CRM system used';
COMMENT ON COLUMN engagement.sold_by IS 'Person who sold the engagement';
COMMENT ON COLUMN engagement.seat_count IS 'Number of seats/licenses';
COMMENT ON COLUMN engagement.hours_allocated IS 'Total hours allocated for project';
COMMENT ON COLUMN engagement.add_ons_purchased IS 'Array of add-on products purchased';