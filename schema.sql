
-- Kanban Project - Postgres schema
-- Safe to run on PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('MANAGER','REP','EXECUTIVE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_enum') THEN
        CREATE TYPE project_status_enum AS ENUM (
            'NEW','KICK_OFF','IN_PROGRESS','LAUNCHED','STALLED','ON_HOLD','CLAWED_BACK','COMPLETED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_enum') THEN
        CREATE TYPE health_enum AS ENUM ('GREEN','YELLOW','RED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_stage_enum') THEN
        CREATE TYPE milestone_stage_enum AS ENUM ('NOT_STARTED','INITIAL_CALL','WORKSHOP','COMPLETED');
    END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role role_enum NOT NULL,
    manager_id UUID NULL REFERENCES app_user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    segment TEXT,
    region TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    status project_status_enum NOT NULL DEFAULT 'NEW',
    health health_enum NOT NULL DEFAULT 'GREEN',
    priority INTEGER NOT NULL DEFAULT 3, -- 1 High .. 5 Low
    start_date DATE,
    target_launch_date DATE,
    status_entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestone_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    weight NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_milestone (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES milestone_template(id) ON DELETE RESTRICT,
    stage milestone_stage_enum NOT NULL DEFAULT 'NOT_STARTED',
    owner_user_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
    due_date DATE,
    stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checklist_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE (engagement_id, template_id)
);

CREATE TABLE IF NOT EXISTS dependency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_milestone_id UUID NOT NULL REFERENCES engagement_milestone(id) ON DELETE CASCADE,
    depends_on_engagement_milestone_id UUID NOT NULL REFERENCES engagement_milestone(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'engagement' or 'engagement_milestone'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- e.g., 'STATUS_CHANGED','STAGE_CHANGED'
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_manager_id ON app_user(manager_id);
CREATE INDEX IF NOT EXISTS idx_engagement_owner ON engagement(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_status_updated ON engagement(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_milestone_stage ON engagement_milestone(stage, stage_entered_at);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);

-- Triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_user ON app_user;
CREATE TRIGGER trg_set_updated_at_user BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_engagement ON engagement;
CREATE TRIGGER trg_set_updated_at_engagement BEFORE UPDATE ON engagement
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Track status_entered_at when engagement.status changes
CREATE OR REPLACE FUNCTION touch_status_entered_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_entered_at = NOW();
    INSERT INTO activity_log(entity_type, entity_id, action, payload_json, user_id)
    VALUES ('engagement', NEW.id, 'STATUS_CHANGED',
            jsonb_build_object('from', OLD.status, 'to', NEW.status), NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_engagement_status ON engagement;
CREATE TRIGGER trg_engagement_status BEFORE UPDATE ON engagement
FOR EACH ROW EXECUTE FUNCTION touch_status_entered_at();

-- Track stage_entered_at when milestone.stage changes
CREATE OR REPLACE FUNCTION touch_stage_entered_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    NEW.stage_entered_at = NOW();
    INSERT INTO activity_log(entity_type, entity_id, action, payload_json, user_id)
    VALUES ('engagement_milestone', NEW.id, 'STAGE_CHANGED',
            jsonb_build_object('from', OLD.stage, 'to', NEW.stage), NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_milestone_stage ON engagement_milestone;
CREATE TRIGGER trg_milestone_stage BEFORE UPDATE ON engagement_milestone
FOR EACH ROW EXECUTE FUNCTION touch_stage_entered_at();

-- Guard: prevent COMPLETED engagement unless all milestones completed
CREATE OR REPLACE FUNCTION guard_engagement_completed() RETURNS TRIGGER AS $$
DECLARE
    incomplete_count INTEGER;
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM 'COMPLETED') THEN
    SELECT COUNT(*) INTO incomplete_count
    FROM engagement_milestone em
    WHERE em.engagement_id = NEW.id
      AND em.stage <> 'COMPLETED';
    IF incomplete_count > 0 THEN
      RAISE EXCEPTION 'Cannot set engagement % to COMPLETED: % milestones still incomplete', NEW.id, incomplete_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_completed ON engagement;
CREATE TRIGGER trg_guard_completed BEFORE UPDATE ON engagement
FOR EACH ROW EXECUTE FUNCTION guard_engagement_completed();

-- View: engagement progress (% complete, unweighted)
CREATE OR REPLACE VIEW vw_engagement_progress AS
SELECT
  e.id AS engagement_id,
  e.name,
  e.status,
  COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED')::decimal / NULLIF(COUNT(em.id),0) AS fraction_complete,
  ROUND(100 * COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED')::decimal / NULLIF(COUNT(em.id),0), 1) AS percent_complete
FROM engagement e
LEFT JOIN engagement_milestone em ON em.engagement_id = e.id
GROUP BY e.id, e.name, e.status;

-- View: derive manager of engagement owner
CREATE OR REPLACE VIEW vw_engagement_with_manager AS
SELECT e.*, au_manager.id AS manager_user_id, au_manager.name AS manager_name
FROM engagement e
JOIN app_user au_owner ON au_owner.id = e.owner_user_id
LEFT JOIN app_user au_manager ON au_manager.id = au_owner.manager_id;

-- Helper function: mark engagement stalled with reason
CREATE OR REPLACE FUNCTION mark_stalled(p_engagement_id UUID, p_reason TEXT) RETURNS VOID AS $$
BEGIN
  UPDATE engagement
  SET status = 'STALLED'
  WHERE id = p_engagement_id;
  INSERT INTO activity_log(entity_type, entity_id, action, payload_json)
  VALUES ('engagement', p_engagement_id, 'MARK_STALLED', jsonb_build_object('reason', p_reason));
END;
$$ LANGUAGE plpgsql;
