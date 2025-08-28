-- STEP 4: Create milestone stages table and integrate with audit logging

-- =============================================
-- 1. CREATE MILESTONE_STAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    color_code VARCHAR(7), -- hex color for UI display
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the milestone stages from types.ts
INSERT INTO milestone_stages (name, description, sort_order, color_code)
VALUES
('NOT_STARTED', 'Milestone has not been started yet', 1, '#6B7280'),
('INITIAL_CALL', 'Initial call has been completed', 2, '#3B82F6'),
('WORKSHOP', 'Workshop phase is in progress or completed', 3, '#F59E0B'),
('COMPLETED', 'Milestone has been fully completed', 4, '#10B981')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. CREATE MILESTONE_STAGE_HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_stage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES milestone_stages(id) ON DELETE RESTRICT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    
    -- Additional context
    previous_stage_id UUID REFERENCES milestone_stages(id),
    duration_in_stage_hours INTEGER, -- calculated when stage changes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 3. UPDATE MILESTONES TABLE
-- =============================================
-- Add current_stage_id to milestones table and remove old stage column
ALTER TABLE milestones 
ADD COLUMN IF NOT EXISTS current_stage_id UUID REFERENCES milestone_stages(id),
DROP COLUMN IF EXISTS stage;

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_milestone_stage_history_milestone ON milestone_stage_history(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_stage_history_stage ON milestone_stage_history(stage_id);
CREATE INDEX IF NOT EXISTS idx_milestone_stage_history_changed_at ON milestone_stage_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_milestones_current_stage ON milestones(current_stage_id);

-- =============================================
-- 5. CREATE AUDIT LOG TRIGGER FOR STAGE CHANGES
-- =============================================
CREATE OR REPLACE FUNCTION log_milestone_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log to audit_logs table when stage changes
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            user_id, 
            user_email, 
            action_type, 
            table_name, 
            record_id, 
            new_values, 
            category, 
            severity
        )
        VALUES (
            NEW.changed_by,
            (SELECT email FROM users WHERE id = NEW.changed_by),
            'STAGE_CHANGE',
            'milestone_stage_history',
            NEW.milestone_id,
            jsonb_build_object(
                'milestone_id', NEW.milestone_id,
                'new_stage_id', NEW.stage_id,
                'previous_stage_id', NEW.previous_stage_id,
                'notes', NEW.notes,
                'changed_at', NEW.changed_at
            ),
            'MILESTONE',
            'INFO'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS milestone_stage_change_audit ON milestone_stage_history;
CREATE TRIGGER milestone_stage_change_audit
    AFTER INSERT ON milestone_stage_history
    FOR EACH ROW
    EXECUTE FUNCTION log_milestone_stage_change();

-- =============================================
-- 6. CREATE HELPER FUNCTION TO CHANGE MILESTONE STAGE
-- =============================================
CREATE OR REPLACE FUNCTION change_milestone_stage(
    p_milestone_id UUID,
    p_new_stage_name VARCHAR(50),
    p_changed_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_new_stage_id UUID;
    v_current_stage_id UUID;
    v_history_id UUID;
    v_previous_changed_at TIMESTAMP WITH TIME ZONE;
    v_duration_hours INTEGER;
BEGIN
    -- Get the new stage ID
    SELECT id INTO v_new_stage_id 
    FROM milestone_stages 
    WHERE name = p_new_stage_name AND is_active = true;
    
    IF v_new_stage_id IS NULL THEN
        RAISE EXCEPTION 'Stage % not found or not active', p_new_stage_name;
    END IF;
    
    -- Get current stage
    SELECT current_stage_id INTO v_current_stage_id
    FROM milestones 
    WHERE id = p_milestone_id;
    
    -- Don't create duplicate entries for same stage
    IF v_current_stage_id = v_new_stage_id THEN
        RAISE NOTICE 'Milestone is already in stage %', p_new_stage_name;
        RETURN NULL;
    END IF;
    
    -- Calculate duration in previous stage
    IF v_current_stage_id IS NOT NULL THEN
        SELECT changed_at INTO v_previous_changed_at
        FROM milestone_stage_history
        WHERE milestone_id = p_milestone_id 
        AND stage_id = v_current_stage_id
        ORDER BY changed_at DESC
        LIMIT 1;
        
        v_duration_hours := EXTRACT(EPOCH FROM (now() - v_previous_changed_at)) / 3600;
    END IF;
    
    -- Insert stage history record
    INSERT INTO milestone_stage_history (
        milestone_id,
        stage_id,
        changed_by,
        notes,
        previous_stage_id,
        duration_in_stage_hours
    )
    VALUES (
        p_milestone_id,
        v_new_stage_id,
        p_changed_by,
        p_notes,
        v_current_stage_id,
        v_duration_hours
    )
    RETURNING id INTO v_history_id;
    
    -- Update current stage in milestones table
    UPDATE milestones 
    SET current_stage_id = v_new_stage_id,
        updated_at = now()
    WHERE id = p_milestone_id;
    
    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. MIGRATE EXISTING MILESTONE DATA (if any exists)
-- =============================================
-- Update existing milestones to have current_stage_id set to NOT_STARTED
UPDATE milestones 
SET current_stage_id = (SELECT id FROM milestone_stages WHERE name = 'NOT_STARTED')
WHERE current_stage_id IS NULL;

-- Create initial stage history for existing milestones
INSERT INTO milestone_stage_history (milestone_id, stage_id, changed_at, notes)
SELECT 
    m.id,
    (SELECT id FROM milestone_stages WHERE name = 'NOT_STARTED'),
    m.created_at,
    'Initial stage set during migration'
FROM milestones m
WHERE NOT EXISTS (
    SELECT 1 FROM milestone_stage_history h 
    WHERE h.milestone_id = m.id
);

-- =============================================
-- 8. VERIFICATION QUERIES
-- =============================================
SELECT 'Milestone Stages Created:' as info, COUNT(*) as count FROM milestone_stages;
SELECT name, color_code FROM milestone_stages ORDER BY sort_order;

SELECT 'Milestones Updated:' as info, COUNT(*) as count 
FROM milestones 
WHERE current_stage_id IS NOT NULL;

SELECT 'Stage History Entries:' as info, COUNT(*) as count FROM milestone_stage_history;