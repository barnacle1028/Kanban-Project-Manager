-- Create Admin User for KanbanPM
-- Run this in Supabase SQL Editor after all schema steps are applied

-- =============================================
-- 1. CREATE ADMIN USER
-- =============================================

-- Insert admin user (password will be 'admin123')
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    is_active, 
    status,
    created_at,
    updated_at
) VALUES (
    'admin@kanbanpm.com',
    '$2b$10$CwTycUXWue0Thq9StjUM0uOHxvRuu8nLO9B.SbKN0RKC4JUOagKKy', -- bcrypt hash for 'admin123'
    'System',
    'Admin', 
    true,
    'active',
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Get the admin user ID for role assignment
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@kanbanpm.com';
    
    -- Get the admin role ID (should exist from your existing schema)
    SELECT id INTO admin_role_id FROM user_roles WHERE role_type = 'Admin' OR name ILIKE '%admin%' LIMIT 1;
    
    -- If we found both IDs, create the role assignment
    IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (
            user_id,
            user_role_id,
            assigned_by,
            is_active,
            effective_from,
            assigned_at
        ) VALUES (
            admin_user_id,
            admin_role_id, 
            admin_user_id, -- self-assigned initially
            true,
            now(),
            now()
        ) ON CONFLICT DO NOTHING;
        
        -- Update organization settings to set global admin
        INSERT INTO organization_settings (setting_key, setting_value, setting_type, description)
        VALUES ('global_admin_user_id', admin_user_id::text, 'text', 'UUID of the global administrator')
        ON CONFLICT (setting_key) DO UPDATE SET 
            setting_value = admin_user_id::text,
            updated_at = now();
            
        RAISE NOTICE 'Admin user created successfully with email: admin@kanbanpm.com';
        RAISE NOTICE 'Temporary password: admin123 (CHANGE THIS IMMEDIATELY!)';
        RAISE NOTICE 'Admin role assigned: %', admin_role_id;
    ELSE
        RAISE NOTICE 'Could not find admin user (%) or admin role (%)', admin_user_id, admin_role_id;
    END IF;
END $$;

-- =============================================
-- 2. CREATE SAMPLE CLIENT ACCOUNT  
-- =============================================

-- Insert a sample client account for testing
INSERT INTO account (
    id,
    name,
    email,
    phone,
    industry,
    company_size,
    is_active,
    status,
    created_at
) VALUES (
    gen_random_uuid(),
    'ABC Corporation',
    'contact@abccorp.com',
    '555-123-4567',
    'Technology',
    'Medium (50-200)',
    true,
    'active',
    now()
) ON CONFLICT DO NOTHING;

-- =============================================
-- 3. CREATE SAMPLE ENGAGEMENT
-- =============================================

DO $$
DECLARE
    account_id UUID;
    admin_user_id UUID;
    engagement_type_id UUID;
    new_engagement_id UUID;
BEGIN
    -- Get the sample account ID
    SELECT id INTO account_id FROM account WHERE name = 'ABC Corporation' LIMIT 1;
    
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@kanbanpm.com';
    
    -- Get a sample engagement type
    SELECT id INTO engagement_type_id FROM engagement_types WHERE name LIKE 'Quick Start%' LIMIT 1;
    
    IF account_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Insert sample engagement
        INSERT INTO engagement (
            id,
            name,
            account_id,
            owner_id,
            engagement_type_id,
            status,
            health,
            priority,
            percent_complete,
            start_date,
            target_launch_date,
            created_at
        ) VALUES (
            gen_random_uuid(),
            'Website Redesign Project',
            account_id,
            admin_user_id,
            engagement_type_id,
            'IN_PROGRESS',
            'GREEN',
            3,
            25,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '60 days',
            now()
        ) RETURNING id INTO new_engagement_id;
        
        -- Create some sample milestones for this engagement
        INSERT INTO milestones (engagement_id, name, stage, due_date, created_at) VALUES
        (new_engagement_id, 'Discovery & Requirements', 'COMPLETED', CURRENT_DATE - INTERVAL '5 days', now()),
        (new_engagement_id, 'Design Mockups', 'IN_PROGRESS', CURRENT_DATE + INTERVAL '10 days', now()),
        (new_engagement_id, 'Development Phase', 'NOT_STARTED', CURRENT_DATE + INTERVAL '30 days', now()),
        (new_engagement_id, 'Testing & Launch', 'NOT_STARTED', CURRENT_DATE + INTERVAL '50 days', now());
        
        -- Add a sample note
        INSERT INTO engagement_notes (
            engagement_id,
            user_id,
            note_content,
            is_internal,
            created_at
        ) VALUES (
            new_engagement_id,
            admin_user_id,
            'Initial kickoff meeting completed. Client is very responsive and has clear requirements.',
            true,
            now()
        );
        
        RAISE NOTICE 'Sample engagement created: %', new_engagement_id;
    END IF;
END $$;

-- =============================================
-- 4. VERIFY DATA CREATION
-- =============================================

-- Show what was created
SELECT 
    'Users' as table_name,
    COUNT(*) as record_count
FROM users
WHERE email = 'admin@kanbanpm.com'

UNION ALL

SELECT 
    'User Role Assignments' as table_name,
    COUNT(*) as record_count  
FROM user_role_assignments ura
JOIN users u ON ura.user_id = u.id
WHERE u.email = 'admin@kanbanpm.com'

UNION ALL

SELECT 
    'Engagement Types' as table_name,
    COUNT(*) as record_count
FROM engagement_types

UNION ALL

SELECT 
    'Sample Accounts' as table_name,
    COUNT(*) as record_count
FROM account
WHERE name = 'ABC Corporation'

UNION ALL

SELECT 
    'Sample Engagements' as table_name,
    COUNT(*) as record_count
FROM engagement e
JOIN account a ON e.account_id = a.id
WHERE a.name = 'ABC Corporation'

UNION ALL

SELECT 
    'Organization Settings' as table_name,
    COUNT(*) as record_count
FROM organization_settings;

-- Show admin user details
SELECT 
    'Admin User Details' as info,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    ur.name as role_name,
    ur.role_type,
    ur.dashboard_access
FROM users u
JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
JOIN user_roles ur ON ura.user_role_id = ur.id
WHERE u.email = 'admin@kanbanpm.com';