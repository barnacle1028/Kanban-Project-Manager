-- User Roles System Migration
-- This migration creates the complete user role management system

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('Admin', 'Manager', 'Consultant', 'Custom')),
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    dashboard_access VARCHAR(20) NOT NULL CHECK (dashboard_access IN ('Admin', 'Manager', 'Rep')),
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL
);

-- 2. Create user_role_assignments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    effective_until TIMESTAMP WITH TIME ZONE,
    
    -- Ensure only one active role assignment per user at a time
    CONSTRAINT unique_active_user_role UNIQUE (user_id, is_active) 
    DEFERRABLE INITIALLY DEFERRED
);

-- 3. Create user_role_change_logs table for audit trail
CREATE TABLE IF NOT EXISTS user_role_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    previous_role_id UUID REFERENCES user_roles(id),
    new_role_id UUID REFERENCES user_roles(id) NOT NULL,
    changed_by UUID REFERENCES users(id) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reason TEXT,
    is_deprecated BOOLEAN DEFAULT false NOT NULL
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role ON user_role_assignments(user_role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_active ON user_role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_user_role_change_logs_user ON user_role_change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_change_logs_date ON user_role_change_logs(changed_at);

-- 5. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Function to handle role assignment changes and logging
CREATE OR REPLACE FUNCTION handle_role_assignment_change()
RETURNS TRIGGER AS $$
DECLARE
    previous_role_id UUID;
BEGIN
    -- Get the previous active role for this user
    SELECT user_role_id INTO previous_role_id
    FROM user_role_assignments 
    WHERE user_id = NEW.user_id 
      AND is_active = true 
      AND id != NEW.id;
    
    -- If this is a new active assignment, deactivate the previous one
    IF NEW.is_active = true AND previous_role_id IS NOT NULL THEN
        UPDATE user_role_assignments 
        SET is_active = false, 
            effective_until = NOW()
        WHERE user_id = NEW.user_id 
          AND is_active = true 
          AND id != NEW.id;
    END IF;
    
    -- Log the role change
    INSERT INTO user_role_change_logs (
        user_id, 
        previous_role_id, 
        new_role_id, 
        changed_by, 
        reason
    ) VALUES (
        NEW.user_id,
        previous_role_id,
        NEW.user_role_id,
        NEW.assigned_by,
        'Role assignment change'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for role assignment changes
CREATE TRIGGER role_assignment_change_trigger
    AFTER INSERT OR UPDATE ON user_role_assignments
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION handle_role_assignment_change();

-- 9. Insert default user roles
INSERT INTO user_roles (name, role_type, description, dashboard_access, permissions, created_by) 
SELECT 
    'System Administrator',
    'Admin',
    'Full system access with all administrative privileges',
    'Admin',
    '{
        "can_access_admin_dashboard": true,
        "can_access_manager_dashboard": true,
        "can_access_rep_dashboard": true,
        "can_create_users": true,
        "can_edit_users": true,
        "can_delete_users": true,
        "can_assign_roles": true,
        "can_create_engagements": true,
        "can_edit_all_engagements": true,
        "can_edit_own_engagements": true,
        "can_delete_engagements": true,
        "can_view_all_engagements": true,
        "can_view_team_engagements": true,
        "can_view_own_engagements": true,
        "can_manage_user_roles": true,
        "can_view_system_logs": true,
        "can_manage_system_settings": true,
        "can_view_all_reports": true,
        "can_view_team_reports": true,
        "can_export_data": true
    }'::jsonb,
    (SELECT id FROM users WHERE email LIKE '%chris%' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'System Administrator');

INSERT INTO user_roles (name, role_type, description, dashboard_access, permissions, created_by)
SELECT 
    'Team Manager',
    'Manager',
    'Manage team members and view team engagements',
    'Manager',
    '{
        "can_access_admin_dashboard": false,
        "can_access_manager_dashboard": true,
        "can_access_rep_dashboard": true,
        "can_create_users": false,
        "can_edit_users": false,
        "can_delete_users": false,
        "can_assign_roles": false,
        "can_create_engagements": true,
        "can_edit_all_engagements": false,
        "can_edit_own_engagements": true,
        "can_delete_engagements": false,
        "can_view_all_engagements": false,
        "can_view_team_engagements": true,
        "can_view_own_engagements": true,
        "can_manage_user_roles": false,
        "can_view_system_logs": false,
        "can_manage_system_settings": false,
        "can_view_all_reports": false,
        "can_view_team_reports": true,
        "can_export_data": true
    }'::jsonb,
    (SELECT id FROM users WHERE email LIKE '%chris%' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'Team Manager');

INSERT INTO user_roles (name, role_type, description, dashboard_access, permissions, created_by)
SELECT 
    'Sales Consultant',
    'Consultant',
    'Manage own engagements and client interactions',
    'Rep',
    '{
        "can_access_admin_dashboard": false,
        "can_access_manager_dashboard": false,
        "can_access_rep_dashboard": true,
        "can_create_users": false,
        "can_edit_users": false,
        "can_delete_users": false,
        "can_assign_roles": false,
        "can_create_engagements": false,
        "can_edit_all_engagements": false,
        "can_edit_own_engagements": true,
        "can_delete_engagements": false,
        "can_view_all_engagements": false,
        "can_view_team_engagements": false,
        "can_view_own_engagements": true,
        "can_manage_user_roles": false,
        "can_view_system_logs": false,
        "can_manage_system_settings": false,
        "can_view_all_reports": false,
        "can_view_team_reports": false,
        "can_export_data": false
    }'::jsonb,
    (SELECT id FROM users WHERE email LIKE '%chris%' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'Sales Consultant');

-- 10. Create views for easier querying
CREATE OR REPLACE VIEW user_roles_with_assignment_count AS
SELECT 
    ur.*,
    COUNT(ura.id) as assigned_user_count,
    COUNT(CASE WHEN ura.is_active = true THEN 1 END) as active_assignment_count
FROM user_roles ur
LEFT JOIN user_role_assignments ura ON ur.id = ura.user_role_id
GROUP BY ur.id;

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
    ur.permissions
FROM users u
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
LEFT JOIN user_roles ur ON ura.user_role_id = ur.id;

-- 11. RLS (Row Level Security) policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_change_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all user roles
CREATE POLICY "Admins can view all user roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users_with_current_role 
            WHERE id = auth.uid() 
            AND (permissions->>'can_manage_user_roles')::boolean = true
        )
    );

-- Policy: Admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users_with_current_role 
            WHERE id = auth.uid() 
            AND (permissions->>'can_manage_user_roles')::boolean = true
        )
    );

-- Policy: Users can see their own role assignments
CREATE POLICY "Users can view own role assignments" ON user_role_assignments
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users_with_current_role 
            WHERE id = auth.uid() 
            AND (permissions->>'can_assign_roles')::boolean = true
        )
    );

-- Policy: Admins can manage role assignments
CREATE POLICY "Admins can manage role assignments" ON user_role_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users_with_current_role 
            WHERE id = auth.uid() 
            AND (permissions->>'can_assign_roles')::boolean = true
        )
    );

-- Policy: Users can view relevant change logs
CREATE POLICY "Users can view relevant change logs" ON user_role_change_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users_with_current_role 
            WHERE id = auth.uid() 
            AND (permissions->>'can_view_system_logs')::boolean = true
        )
    );

COMMIT;