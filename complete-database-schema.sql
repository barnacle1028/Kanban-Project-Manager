-- Complete KanbanPM Database Schema
-- Missing Tables to Create in Supabase

-- =============================================
-- 1. USERS TABLE (for authentication and login)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add password history tracking
CREATE TABLE IF NOT EXISTS user_password_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 2. ENGAGEMENT TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS engagement_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_duration_hours INTEGER, -- estimated hours for this type
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert all your engagement types
INSERT INTO engagement_types (name, description, default_duration_hours, sort_order) VALUES
('Quick Start 4-Hour', 'Quick Start engagement with 4 hour scope', 4, 1),
('Quick Start 10-Hour', 'Quick Start engagement with 10 hour scope', 10, 2),
('Quick Start 15-Hour', 'Quick Start engagement with 15 hour scope', 15, 3),
('Engage (1-19)', 'Standard Engage package for 1-19 users', 40, 4),
('Engage (1-19)+One (1) Add-on', 'Engage 1-19 with one add-on', 50, 5),
('Engage (1-19)+Two (2) Add-ons', 'Engage 1-19 with two add-ons', 60, 6),
('Engage (1-19)+Three (3) Add-ons', 'Engage 1-19 with three add-ons', 70, 7),
('Engage (20-49)', 'Standard Engage package for 20-49 users', 80, 8),
('Engage (20-49)+One (1) Add-on Lite', 'Engage 20-49 with one lite add-on', 90, 9),
('Engage (20-49)+One (1) Add-on Starter', 'Engage 20-49 with one starter add-on', 95, 10),
('Engage (20-49)+Two (2) Add-ons Starter', 'Engage 20-49 with two starter add-ons', 105, 11),
('Engage (20-49)+Two (2) Add-ons Premium', 'Engage 20-49 with two premium add-ons', 110, 12),
('Engage (20-49)+Three (3) Add-ons Premium', 'Engage 20-49 with three premium add-ons', 120, 13),
('Engage (20-49)+Three (3) Add-ons Advanced', 'Engage 20-49 with three advanced add-ons', 130, 14),
('EngagePlus (20-49)', 'Enhanced Engage package for 20-49 users', 100, 15),
('Engage (50-99)', 'Standard Engage package for 50-99 users', 160, 16),
('Engage (50-99)+One (1) Add-on', 'Engage 50-99 with one add-on', 180, 17),
('Engage (50-99)+Two (2) Add-ons', 'Engage 50-99 with two add-ons', 200, 18),
('Engage (50-99)+Three (3) Add-ons', 'Engage 50-99 with three add-ons', 220, 19),
('EngagePlus (50-99)', 'Enhanced Engage package for 50-99 users', 200, 20),
('Lite Platform Add-on (1-49)', 'Lite platform add-on for 1-49 users', 20, 21),
('Starter Platform Add-on (49-100)', 'Starter platform add-on for 49-100 users', 30, 22),
('Premium Platform Add-on', 'Premium platform add-on', 40, 23),
('Advanced Platform Add-on', 'Advanced platform add-on', 50, 24),
('Basic Virtual Training (1-25)', 'Basic virtual training for 1-25 users', 16, 25),
('Preferred Virtual Training (1-100)', 'Preferred virtual training for 1-100 users', 32, 26),
('Basic Optimization (1-25)', 'Basic optimization for 1-25 users', 20, 27),
('Preferred Optimization (1-100)', 'Preferred optimization for 1-100 users', 40, 28),
('Managed Services (3 months)', '3-month managed services package', 120, 29),
('Managed Services (6 months)', '6-month managed services package', 240, 30),
('Managed Services (12 months)', '12-month managed services package', 480, 31),
('Expansion (1-19)', 'Expansion services for 1-19 users', 30, 32),
('Expansion (20-49)', 'Expansion services for 20-49 users', 60, 33),
('Expansion (50-99)', 'Expansion services for 50-99 users', 120, 34),
('4 hours of technical support', 'Technical support package - 4 hours', 4, 35),
('10 hours of technical support', 'Technical support package - 10 hours', 10, 36),
('15 hours of technical support', 'Technical support package - 15 hours', 15, 37),
('Basic Optimization', 'Basic optimization services', 20, 38),
('Basic Virtual Training', 'Basic virtual training services', 16, 39),
('Training for one user group/team', 'Focused training for specific team', 8, 40),
('Custom Scope', 'Custom scoped engagement', NULL, 41);

-- =============================================
-- 3. ORGANIZATION SETTINGS TABLE
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
INSERT INTO organization_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('organization_name', 'KanbanPM Organization', 'text', 'Organization/Company Name', true),
('company_logo_url', NULL, 'file', 'URL to company logo file', true),
('primary_color', '#68BA7F', 'text', 'Primary brand color', true),
('secondary_color', '#253D2C', 'text', 'Secondary brand color', true),
('timezone', 'America/New_York', 'text', 'Default timezone for the organization', false),
('hq_address', NULL, 'json', 'Headquarters address as JSON object', false),
('global_admin_user_id', NULL, 'text', 'UUID of the global administrator', false),
('allow_user_registration', false, 'boolean', 'Allow users to self-register', false),
('default_engagement_type', NULL, 'text', 'Default engagement type ID', false);

-- =============================================
-- 4. ENGAGEMENT NOTES TABLE
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
-- 5. TIME TRACKING TABLE
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
-- 6. AUDIT LOG TABLE
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
-- 7. PRIMARY CONTACTS TABLE (for engagements)
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
-- MODIFY EXISTING TABLES
-- =============================================

-- Add engagement_type_id to engagement table
ALTER TABLE engagement 
ADD COLUMN IF NOT EXISTS engagement_type_id UUID REFERENCES engagement_types(id),
ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES primary_contacts(id);

-- Connect users to user_role_assignments (if not already done)
ALTER TABLE user_role_assignments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

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

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_engagement_types_updated_at BEFORE UPDATE ON engagement_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_engagement_notes_updated_at BEFORE UPDATE ON engagement_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_primary_contacts_updated_at BEFORE UPDATE ON primary_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate time entry duration
CREATE OR REPLACE FUNCTION calculate_time_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
        
        -- Round to nearest 15 minutes for billing if billable
        IF NEW.is_billable THEN
            NEW.duration_minutes = CEIL(NEW.duration_minutes / 15.0) * 15;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_time_entry_duration 
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_time_duration();

-- =============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (you may need to adjust based on your auth setup)
-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = id);

-- Admins can see all audit logs, others can only see their own actions
CREATE POLICY audit_logs_policy ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users u JOIN user_role_assignments ura ON u.id = ura.user_id 
               JOIN user_roles ur ON ura.role_id = ur.id 
               WHERE u.id = auth.uid() AND ur.role_name = 'admin')
    );

-- Users can see time entries for engagements they're assigned to
CREATE POLICY time_entries_access ON time_entries
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM engagement e WHERE e.id = engagement_id AND e.owner_id = auth.uid())
    );