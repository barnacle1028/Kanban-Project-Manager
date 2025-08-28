-- STEP 5: Create milestone templates based on standardMilestones.ts

-- =============================================
-- 1. CREATE MILESTONE_TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_standard BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    default_owner_role VARCHAR(50), -- 'REP', 'MANAGER', 'ADMIN'
    estimated_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the 10 standard milestones from standardMilestones.ts
INSERT INTO milestone_templates (name, description, is_standard, sort_order, default_owner_role, estimated_hours)
VALUES
('Kick-Off', 'Initial project kick-off meeting and setup', true, 1, 'REP', 4),
('Workflow Design', 'Design and document workflow processes', true, 2, 'REP', 16),
('Content Strategy', 'Develop content strategy and framework', true, 3, 'REP', 12),
('CRM Integration', 'Integrate with customer CRM system', true, 4, 'REP', 20),
('Data Migration', 'Migrate existing data to new system', true, 5, 'REP', 24),
('Change Readiness', 'Prepare organization for change management', true, 6, 'REP', 8),
('User Training', 'Conduct training sessions for end users', true, 7, 'REP', 16),
('User Office Hours', 'Provide ongoing user support and office hours', true, 8, 'REP', 8),
('Manager Training', 'Train managers on system oversight', true, 9, 'REP', 12),
('Admin Training', 'Train system administrators', true, 10, 'REP', 8)
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. CREATE FUNCTION TO GENERATE STANDARD MILESTONES
-- =============================================
CREATE OR REPLACE FUNCTION create_standard_milestones_for_engagement(
    p_engagement_id UUID,
    p_assigned_rep_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS TABLE(milestone_id UUID, template_name VARCHAR, milestone_name VARCHAR) AS $$
DECLARE
    v_template RECORD;
    v_milestone_id UUID;
    v_not_started_stage_id UUID;
BEGIN
    -- Get NOT_STARTED stage ID
    SELECT id INTO v_not_started_stage_id 
    FROM milestone_stages 
    WHERE name = 'NOT_STARTED';
    
    IF v_not_started_stage_id IS NULL THEN
        RAISE EXCEPTION 'NOT_STARTED stage not found';
    END IF;
    
    -- Loop through standard milestone templates
    FOR v_template IN 
        SELECT * FROM milestone_templates 
        WHERE is_standard = true AND is_active = true 
        ORDER BY sort_order
    LOOP
        -- Create milestone from template
        INSERT INTO milestones (
            engagement_id,
            name,
            description,
            owner_id,
            current_stage_id,
            is_standard,
            estimated_hours,
            created_at,
            updated_at
        )
        VALUES (
            p_engagement_id,
            v_template.name,
            v_template.description,
            p_assigned_rep_id,
            v_not_started_stage_id,
            true,
            v_template.estimated_hours,
            p_start_date,
            p_start_date
        )
        RETURNING id INTO v_milestone_id;
        
        -- Create initial stage history entry
        INSERT INTO milestone_stage_history (
            milestone_id,
            stage_id,
            changed_by,
            changed_at,
            notes
        )
        VALUES (
            v_milestone_id,
            v_not_started_stage_id,
            p_assigned_rep_id,
            p_start_date,
            'Initial milestone created from template'
        );
        
        -- Return the created milestone info
        milestone_id := v_milestone_id;
        template_name := v_template.name;
        milestone_name := v_template.name;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. CREATE CUSTOM MILESTONE FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION create_custom_milestone(
    p_engagement_id UUID,
    p_name VARCHAR(255),
    p_description TEXT,
    p_owner_id UUID,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_estimated_hours INTEGER DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_milestone_id UUID;
    v_not_started_stage_id UUID;
BEGIN
    -- Get NOT_STARTED stage ID
    SELECT id INTO v_not_started_stage_id 
    FROM milestone_stages 
    WHERE name = 'NOT_STARTED';
    
    -- Create the custom milestone
    INSERT INTO milestones (
        engagement_id,
        name,
        description,
        owner_id,
        current_stage_id,
        due_date,
        estimated_hours,
        is_standard,
        created_at,
        updated_at
    )
    VALUES (
        p_engagement_id,
        p_name,
        p_description,
        p_owner_id,
        v_not_started_stage_id,
        p_due_date,
        p_estimated_hours,
        false, -- custom milestones are not standard
        now(),
        now()
    )
    RETURNING id INTO v_milestone_id;
    
    -- Create initial stage history entry
    INSERT INTO milestone_stage_history (
        milestone_id,
        stage_id,
        changed_by,
        changed_at,
        notes
    )
    VALUES (
        v_milestone_id,
        v_not_started_stage_id,
        COALESCE(p_created_by, p_owner_id),
        now(),
        'Custom milestone created'
    );
    
    RETURN v_milestone_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_milestone_templates_standard ON milestone_templates(is_standard, is_active);
CREATE INDEX IF NOT EXISTS idx_milestone_templates_sort ON milestone_templates(sort_order);

-- =============================================
-- 5. ADD MISSING COLUMNS TO MILESTONES TABLE
-- =============================================
-- Add columns that might be missing from the current milestones table
ALTER TABLE milestones 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS actual_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Remove the old owner column if it exists as string
ALTER TABLE milestones DROP COLUMN IF EXISTS owner;

-- Create index for milestone owner lookups
CREATE INDEX IF NOT EXISTS idx_milestones_owner ON milestones(owner_id);
CREATE INDEX IF NOT EXISTS idx_milestones_engagement ON milestones(engagement_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);

-- =============================================
-- 6. CREATE VIEW FOR MILESTONE WITH STAGE INFO
-- =============================================
CREATE OR REPLACE VIEW milestone_details AS
SELECT 
    m.id,
    m.engagement_id,
    m.name,
    m.description,
    m.owner_id,
    CONCAT(u.first_name, ' ', u.last_name) as owner_name,
    u.email as owner_email,
    m.due_date,
    m.estimated_hours,
    m.actual_hours,
    m.is_standard,
    m.is_completed,
    m.completed_at,
    m.notes,
    m.created_at,
    m.updated_at,
    
    -- Current stage info
    ms.id as current_stage_id,
    ms.name as current_stage_name,
    ms.description as current_stage_description,
    ms.color_code as current_stage_color,
    
    -- Latest stage change info
    msh.changed_at as last_stage_change,
    msh.changed_by as last_changed_by,
    CONCAT(stage_changer.first_name, ' ', stage_changer.last_name) as last_changed_by_name,
    msh.notes as last_change_notes
    
FROM milestones m
LEFT JOIN users u ON m.owner_id = u.id
LEFT JOIN milestone_stages ms ON m.current_stage_id = ms.id
LEFT JOIN LATERAL (
    SELECT * FROM milestone_stage_history 
    WHERE milestone_id = m.id 
    ORDER BY changed_at DESC 
    LIMIT 1
) msh ON true
LEFT JOIN users stage_changer ON msh.changed_by = stage_changer.id;

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================
SELECT 'Milestone Templates Created:' as info, COUNT(*) as count FROM milestone_templates;
SELECT name, sort_order, default_owner_role, estimated_hours 
FROM milestone_templates 
WHERE is_standard = true 
ORDER BY sort_order;

-- Test the function (commented out - uncomment if you have test data)
-- SELECT * FROM create_standard_milestones_for_engagement(
--     'test-engagement-id'::UUID, 
--     'test-user-id'::UUID, 
--     now()
-- );