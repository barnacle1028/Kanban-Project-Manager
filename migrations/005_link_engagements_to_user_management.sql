-- Migration: Link engagement system to user management system
-- Date: 2025-08-22
-- Purpose: Properly integrate engagements with the user management system

-- 1. Add a proper foreign key to the users table for assigned_rep
ALTER TABLE engagement ADD COLUMN IF NOT EXISTS assigned_rep_user_id UUID REFERENCES users(id);

-- 2. Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_engagement_assigned_rep_user ON engagement(assigned_rep_user_id);

-- 3. Update existing engagements to link assigned_rep names to actual users
UPDATE engagement 
SET assigned_rep_user_id = u.id
FROM users u 
WHERE engagement.assigned_rep IS NOT NULL 
  AND engagement.assigned_rep_user_id IS NULL
  AND (
    CONCAT(u.first_name, ' ', u.last_name) = engagement.assigned_rep 
    OR u.first_name = engagement.assigned_rep
    OR u.last_name = engagement.assigned_rep
  );

-- 4. Create a view for engagements with user details
CREATE OR REPLACE VIEW engagements_with_user_details AS
SELECT 
  e.*,
  u.first_name as assigned_rep_first_name,
  u.last_name as assigned_rep_last_name,
  CONCAT(u.first_name, ' ', u.last_name) as assigned_rep_full_name,
  u.email as assigned_rep_email,
  ur.role_type as assigned_rep_role_type,
  ur.dashboard_access as assigned_rep_dashboard_access
FROM engagement e
LEFT JOIN users u ON e.assigned_rep_user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
LEFT JOIN user_roles ur ON ura.user_role_id = ur.id;

-- 5. Update the owner_user_id to also reference the users table (if it doesn't already)
-- First check if we need to migrate from app_user to users
DO $$
BEGIN
  -- Update owner_user_id to reference users table instead of app_user
  -- This assumes engagement.owner_user_id currently references app_user
  -- and we want to migrate to the users table
  
  -- Drop the old foreign key constraint if it exists
  ALTER TABLE engagement DROP CONSTRAINT IF EXISTS engagement_owner_user_id_fkey;
  
  -- Add new foreign key constraint to users table
  ALTER TABLE engagement ADD CONSTRAINT engagement_owner_user_id_fkey 
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT;
    
EXCEPTION WHEN OTHERS THEN
  -- If the constraint already exists or there's an issue, continue
  RAISE NOTICE 'Foreign key constraint update completed or already exists';
END $$;

-- 6. Function to get available reps (matching the backend query)
CREATE OR REPLACE FUNCTION get_available_reps_from_user_management()
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role_type TEXT,
  dashboard_access TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    u.id,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    u.first_name,
    u.last_name,
    u.email,
    ur.role_type,
    ur.dashboard_access
  FROM users u
  JOIN user_role_assignments ura ON u.id = ura.user_id 
  JOIN user_roles ur ON ura.user_role_id = ur.id
  WHERE ura.is_active = true 
    AND u.is_active = true 
    AND u.status = 'active'
    AND ur.dashboard_access IN ('Rep', 'Manager', 'Admin')
  ORDER BY u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- 7. Create sample users and roles if they don't exist (for testing)
-- This ensures the system works even if the user management migrations haven't been run yet

-- Insert sample roles if user_roles table exists and is empty
INSERT INTO user_roles (name, role_type, dashboard_access, description, permissions, created_by) 
SELECT 
  'Sales Representative',
  'Consultant',
  'Rep',
  'Sales representative with access to rep dashboard',
  '{"can_view_engagements": true, "can_edit_own_engagements": true}'::jsonb,
  (SELECT id FROM users WHERE email = 'chris@company.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'Sales Representative')
  AND EXISTS (SELECT 1 FROM users WHERE email = 'chris@company.com');

INSERT INTO user_roles (name, role_type, dashboard_access, description, permissions, created_by) 
SELECT 
  'Sales Manager',
  'Manager', 
  'Manager',
  'Sales manager with access to manager dashboard',
  '{"can_view_all_engagements": true, "can_edit_all_engagements": true, "can_assign_engagements": true}'::jsonb,
  (SELECT id FROM users WHERE email = 'chris@company.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'Sales Manager')
  AND EXISTS (SELECT 1 FROM users WHERE email = 'chris@company.com');

-- Insert sample users if they don't exist
INSERT INTO users (
  email, first_name, last_name, status, is_active, employee_type, 
  department, job_title, must_change_password
) VALUES 
  ('dakota@company.com', 'Dakota', 'Sales', 'active', true, 'full_time', 'Sales', 'Sales Representative', false),
  ('amanda@company.com', 'Amanda', 'Johnson', 'active', true, 'full_time', 'Sales', 'Sales Representative', false),
  ('rolando@company.com', 'Rolando', 'Martinez', 'active', true, 'full_time', 'Sales', 'Sales Representative', false),
  ('lisa@company.com', 'Lisa', 'Chen', 'active', true, 'full_time', 'Sales', 'Sales Representative', false),
  ('steph@company.com', 'Steph', 'Williams', 'active', true, 'full_time', 'Sales', 'Sales Manager', false),
  ('josh@company.com', 'Josh', 'Brown', 'active', true, 'full_time', 'Sales', 'Sales Representative', false)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Assign roles to users
DO $$
DECLARE
  rep_role_id UUID;
  manager_role_id UUID;
  chris_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO rep_role_id FROM user_roles WHERE name = 'Sales Representative' LIMIT 1;
  SELECT id INTO manager_role_id FROM user_roles WHERE name = 'Sales Manager' LIMIT 1;
  SELECT id INTO chris_id FROM users WHERE email = 'chris@company.com' LIMIT 1;
  
  IF rep_role_id IS NOT NULL AND chris_id IS NOT NULL THEN
    -- Assign Sales Representative role to reps
    INSERT INTO user_role_assignments (user_id, user_role_id, assigned_by, is_active, effective_from)
    SELECT u.id, rep_role_id, chris_id, true, NOW()
    FROM users u 
    WHERE u.email IN ('dakota@company.com', 'amanda@company.com', 'rolando@company.com', 'lisa@company.com', 'josh@company.com')
    ON CONFLICT DO NOTHING;
    
    -- Assign Sales Manager role to managers
    INSERT INTO user_role_assignments (user_id, user_role_id, assigned_by, is_active, effective_from)
    SELECT u.id, manager_role_id, chris_id, true, NOW()
    FROM users u 
    WHERE u.email IN ('steph@company.com')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 8. Add helpful comments
COMMENT ON COLUMN engagement.assigned_rep_user_id IS 'Foreign key to users table for the assigned representative';
COMMENT ON COLUMN engagement.assigned_rep IS 'Display name of assigned rep (kept for backward compatibility, use assigned_rep_user_id for linking)';

-- 9. Create trigger to automatically update assigned_rep when assigned_rep_user_id changes
CREATE OR REPLACE FUNCTION update_assigned_rep_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_rep_user_id IS NOT NULL AND NEW.assigned_rep_user_id != OLD.assigned_rep_user_id THEN
    SELECT CONCAT(first_name, ' ', last_name) 
    INTO NEW.assigned_rep 
    FROM users 
    WHERE id = NEW.assigned_rep_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_assigned_rep_display_name ON engagement;
CREATE TRIGGER trg_update_assigned_rep_display_name
  BEFORE UPDATE ON engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_assigned_rep_display_name();