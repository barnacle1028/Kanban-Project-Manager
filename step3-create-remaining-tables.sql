-- STEP 3: Create remaining tables from PDS requirements

-- =============================================
-- 1. ORGANIZATION SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- text, json, boolean, number, file
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- can non-admins see this setting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default organization settings
INSERT INTO organization_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
('organization_name', 'KanbanPM Organization', 'text', 'Organization/Company Name', true),
('company_logo_url', NULL, 'file', 'URL to company logo file', true),
('primary_color', '#68BA7F', 'text', 'Primary brand color', true),
('secondary_color', '#253D2C', 'text', 'Secondary brand color', true),
('timezone', 'America/New_York', 'text', 'Default timezone for the organization', false),
('hq_address', NULL, 'json', 'Headquarters address as JSON object', false),
('global_admin_user_id', NULL, 'text', 'UUID of the global administrator', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- 2. PRIMARY CONTACTS TABLE (for client accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS primary_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    
    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    title VARCHAR(100),
    department VARCHAR(100),
    
    -- Preferences
    is_primary BOOLEAN DEFAULT false,
    receive_notifications BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 3. ENGAGEMENT NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS engagement_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    engagement_id UUID NOT NULL REFERENCES engagement(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true, -- internal team notes vs client-visible
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 4. TIME TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    engagement_id UUID NOT NULL REFERENCES engagement(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    
    -- Time tracking
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- calculated field, stored for reporting
    
    -- Billing
    is_billable BOOLEAN DEFAULT true,
    billing_rate DECIMAL(10,2), -- hourly rate for this entry
    
    -- Description
    description TEXT,
    task_description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, approved
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure duration is in 15-minute increments for billing
    CONSTRAINT check_billing_increment CHECK (
        NOT is_billable OR duration_minutes % 15 = 0
    )
);

-- =============================================
-- 5. AUDIT LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Who and When
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- store email in case user is deleted
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- What happened
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    table_name VARCHAR(100), -- which table was affected
    record_id UUID, -- ID of the affected record
    
    -- Details
    old_values JSONB, -- previous values (for UPDATE/DELETE)
    new_values JSONB, -- new values (for CREATE/UPDATE)
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    -- Categorization
    category VARCHAR(50), -- USER, ENGAGEMENT, MILESTONE, SETTINGS, etc.
    severity VARCHAR(20) DEFAULT 'INFO' -- DEBUG, INFO, WARN, ERROR, CRITICAL
);

-- =============================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================

-- Add engagement_type_id to engagement table
ALTER TABLE engagement 
ADD COLUMN IF NOT EXISTS engagement_type_id UUID REFERENCES engagement_types(id),
ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES primary_contacts(id);

-- Add user_id to user_role_assignments if missing
ALTER TABLE user_role_assignments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- =============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Time entries indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_engagement ON time_entries(engagement_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(is_billable);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_engagement_notes_engagement ON engagement_notes(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_notes_user ON engagement_notes(user_id);

-- Primary contacts indexes
CREATE INDEX IF NOT EXISTS idx_primary_contacts_account ON primary_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_primary_contacts_primary ON primary_contacts(is_primary);

-- =============================================
-- 8. VERIFICATION QUERIES
-- =============================================

-- Check what tables were created
SELECT 'Table Creation Summary' as info;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t 
WHERE table_schema = 'public' 
AND table_name IN ('organization_settings', 'primary_contacts', 'engagement_notes', 'time_entries', 'audit_logs')
ORDER BY table_name;

-- Show organization settings
SELECT 'Organization Settings:' as info, setting_key, setting_value 
FROM organization_settings 
ORDER BY setting_key;