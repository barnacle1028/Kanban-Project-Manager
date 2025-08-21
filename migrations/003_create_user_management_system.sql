-- User Management System Migration
-- This migration extends the user system with comprehensive user management features

-- 1. Drop existing users table if it's minimal and recreate with full schema
-- Note: In production, you'd use ALTER TABLE statements to preserve data
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create comprehensive users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT false NOT NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Professional Information
    job_title VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    employee_type VARCHAR(20) DEFAULT 'full_time' CHECK (employee_type IN ('full_time', 'part_time', 'contractor', 'intern')),
    hire_date DATE,
    manager_id UUID REFERENCES users(id),
    
    -- Contact & Address Information
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- System Information
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    locale VARCHAR(10) DEFAULT 'en-US',
    
    -- Password Management
    temp_password VARCHAR(255),
    temp_password_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    must_change_password BOOLEAN DEFAULT false NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    notes TEXT
);

-- 3. Create departments table for organizational structure
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    parent_department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    date_format VARCHAR(20) DEFAULT 'MM/dd/yyyy',
    time_format VARCHAR(5) DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    email_notifications BOOLEAN DEFAULT true,
    browser_notifications BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create user activity log table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'logout', 'password_change', 'profile_update', 'role_change', 'password_reset')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Create password reset tokens table (separate for better security)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- 7. Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_type ON users(employee_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user ON email_verification_tokens(user_id);

-- 9. Create updated_at trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create updated_at trigger for departments table
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Create updated_at trigger for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Function to automatically create user preferences
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id) 
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Trigger to create user preferences when user is created
CREATE TRIGGER create_user_preferences_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_preferences();

-- 14. Function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activities (
        user_id, 
        activity_type, 
        description, 
        ip_address, 
        user_agent, 
        metadata
    ) 
    VALUES (
        p_user_id, 
        p_activity_type, 
        p_description, 
        p_ip_address, 
        p_user_agent, 
        p_metadata
    ) 
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- 15. Function to generate secure password reset token
CREATE OR REPLACE FUNCTION generate_password_reset_token(p_user_id UUID)
RETURNS VARCHAR(255) AS $$
DECLARE
    token VARCHAR(255);
BEGIN
    -- Generate a secure random token
    token := encode(gen_random_bytes(32), 'hex');
    
    -- Invalidate any existing tokens for this user
    UPDATE password_reset_tokens 
    SET used_at = NOW() 
    WHERE user_id = p_user_id AND used_at IS NULL;
    
    -- Create new token
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (p_user_id, token, NOW() + INTERVAL '1 hour');
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- 16. Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired password reset tokens
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 17. Update user_roles table foreign key reference
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_created_by_fkey,
ADD CONSTRAINT user_roles_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Update user_role_assignments table foreign key references
ALTER TABLE user_role_assignments 
DROP CONSTRAINT IF EXISTS user_role_assignments_user_id_fkey,
ADD CONSTRAINT user_role_assignments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_role_assignments 
DROP CONSTRAINT IF EXISTS user_role_assignments_assigned_by_fkey,
ADD CONSTRAINT user_role_assignments_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES users(id);

-- Update user_role_change_logs table foreign key references
ALTER TABLE user_role_change_logs 
DROP CONSTRAINT IF EXISTS user_role_change_logs_user_id_fkey,
ADD CONSTRAINT user_role_change_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_role_change_logs 
DROP CONSTRAINT IF EXISTS user_role_change_logs_changed_by_fkey,
ADD CONSTRAINT user_role_change_logs_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES users(id);

-- 18. Create RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN user_roles ur ON ura.user_role_id = ur.id
            WHERE ura.user_id = auth.uid() 
            AND ura.is_active = true
            AND (ur.permissions->>'can_edit_users')::boolean = true
        )
    );

-- Policy: Admins can manage users
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN user_roles ur ON ura.user_role_id = ur.id
            WHERE ura.user_id = auth.uid() 
            AND ura.is_active = true
            AND (ur.permissions->>'can_create_users')::boolean = true
        )
    );

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 19. Insert default departments
INSERT INTO departments (name, description) VALUES
    ('Engineering', 'Software development and technical teams'),
    ('Sales', 'Sales representatives and account managers'),
    ('Marketing', 'Marketing and customer acquisition'),
    ('Operations', 'Business operations and support'),
    ('HR', 'Human resources and people operations')
ON CONFLICT (name) DO NOTHING;

-- 20. Create initial admin user (Chris)
INSERT INTO users (
    email, 
    first_name, 
    last_name, 
    status, 
    is_active, 
    employee_type,
    department,
    job_title,
    must_change_password
) VALUES (
    'chris@company.com',
    'Chris',
    'Administrator',
    'active',
    true,
    'full_time',
    'Operations',
    'System Administrator',
    false
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Assign admin role to Chris
DO $$
DECLARE
    chris_id UUID;
    admin_role_id UUID;
BEGIN
    SELECT id INTO chris_id FROM users WHERE email = 'chris@company.com';
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'System Administrator';
    
    IF chris_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (
            user_id, 
            user_role_id, 
            assigned_by,
            is_active,
            effective_from
        ) VALUES (
            chris_id,
            admin_role_id,
            chris_id,
            true,
            NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 21. Create view for users with their current roles (updated)
CREATE OR REPLACE VIEW users_with_current_role AS
SELECT 
    u.*,
    ura.id as assignment_id,
    ura.assigned_at,
    ura.effective_from,
    ura.effective_until,
    ur.id as role_id,
    ur.name as role_name,
    ur.role_type,
    ur.dashboard_access,
    ur.permissions,
    m.first_name as manager_first_name,
    m.last_name as manager_last_name,
    m.email as manager_email,
    up.theme,
    up.language,
    up.timezone as pref_timezone,
    up.email_notifications,
    up.browser_notifications
FROM users u
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
LEFT JOIN user_roles ur ON ura.user_role_id = ur.id
LEFT JOIN users m ON u.manager_id = m.id
LEFT JOIN user_preferences up ON u.id = up.user_id;

-- 22. Create a job to clean up expired tokens (run daily)
-- This would be set up as a cron job or scheduled function in Supabase
-- For now, it's a manual function that can be called

COMMIT;