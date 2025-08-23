-- Database Schema for Kanban Application
-- Based on actual UI requirements from AdminPanel and EngagementAdmin components

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USER MANAGEMENT TABLES
-- ========================================

-- User Roles Table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('Admin', 'Manager', 'Consultant', 'Custom')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    dashboard_access VARCHAR(20) NOT NULL CHECK (dashboard_access IN ('Admin', 'Manager', 'Rep')),
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);

-- Main Users Table (called 'account' based on error message)
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT false,
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
    employee_type VARCHAR(20) NOT NULL DEFAULT 'full_time' CHECK (employee_type IN ('full_time', 'part_time', 'contractor', 'intern')),
    hire_date DATE,
    manager_id UUID REFERENCES account(id),
    
    -- Contact & Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- System Information
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    
    -- Password Management
    temp_password VARCHAR(255),
    temp_password_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    
    -- Role Assignment
    user_role_id UUID REFERENCES user_roles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES account(id),
    notes TEXT
);

-- User Role Assignments (for tracking role changes)
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    user_role_id UUID NOT NULL REFERENCES user_roles(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID NOT NULL REFERENCES account(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- ENGAGEMENT MANAGEMENT TABLES
-- ========================================

-- Main Engagements Table
CREATE TABLE engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL, -- Company name
    assigned_rep VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'KICK_OFF', 'IN_PROGRESS', 'LAUNCHED', 'STALLED', 'ON_HOLD', 'CLAWED_BACK', 'COMPLETED')),
    health VARCHAR(10) NOT NULL DEFAULT 'GREEN' CHECK (health IN ('GREEN', 'YELLOW', 'RED')),
    
    -- Dates
    start_date DATE,
    close_date DATE,
    
    -- Sales Information
    sales_type VARCHAR(20) CHECK (sales_type IN ('Channel', 'Direct Sell', 'Greaser Sale')),
    speed VARCHAR(10) CHECK (speed IN ('Slow', 'Medium', 'Fast')),
    crm VARCHAR(20) CHECK (crm IN ('Salesforce', 'Dynamics', 'Hubspot', 'Other', 'None')),
    sold_by VARCHAR(255),
    seat_count INTEGER DEFAULT 0,
    hours_alloted INTEGER DEFAULT 0,
    
    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    
    -- Links
    avaza_link TEXT,
    project_folder_link TEXT,
    client_website_link TEXT,
    linkedin_link TEXT,
    
    -- Add-ons (stored as JSON array)
    add_ons_purchased JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES account(id)
);

-- Milestones Table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (stage IN ('NOT_STARTED', 'INITIAL_CALL', 'WORKSHOP', 'COMPLETED')),
    owner VARCHAR(255),
    due_date DATE,
    not_purchased BOOLEAN DEFAULT false,
    is_standard BOOLEAN DEFAULT false, -- Standard milestones cannot be deleted
    stage_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================

-- User indexes
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_status ON account(status);
CREATE INDEX idx_account_is_active ON account(is_active);
CREATE INDEX idx_account_user_role_id ON account(user_role_id);
CREATE INDEX idx_account_manager_id ON account(manager_id);
CREATE INDEX idx_account_created_at ON account(created_at);

-- User role indexes
CREATE INDEX idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_is_active ON user_role_assignments(is_active);

-- Engagement indexes
CREATE INDEX idx_engagement_status ON engagement(status);
CREATE INDEX idx_engagement_health ON engagement(health);
CREATE INDEX idx_engagement_assigned_rep ON engagement(assigned_rep);
CREATE INDEX idx_engagement_account_name ON engagement(account_name);
CREATE INDEX idx_engagement_start_date ON engagement(start_date);
CREATE INDEX idx_engagement_close_date ON engagement(close_date);
CREATE INDEX idx_engagement_created_at ON engagement(created_at);

-- Milestone indexes
CREATE INDEX idx_milestones_engagement_id ON milestones(engagement_id);
CREATE INDEX idx_milestones_stage ON milestones(stage);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engagement_updated_at BEFORE UPDATE ON engagement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DEFAULT ROLES
-- ========================================

INSERT INTO user_roles (id, name, role_type, description, dashboard_access, permissions, created_by) VALUES
(
    uuid_generate_v4(),
    'System Administrator',
    'Admin',
    'Full system access with all permissions',
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
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'Team Manager',
    'Manager',
    'Management level access for team oversight',
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
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'Consultant',
    'Consultant',
    'Individual contributor access for consultants',
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
    uuid_generate_v4()
);