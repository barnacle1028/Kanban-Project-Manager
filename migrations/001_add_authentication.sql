-- Migration: Add Authentication Support
-- Run after initial schema.sql

-- Update role enum to include ADMIN
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN' AND enumtypid = 'role_enum'::regtype) THEN
        ALTER TYPE role_enum ADD VALUE 'ADMIN';
    END IF;
END $$;

-- Add authentication fields to app_user table
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;

-- Create refresh tokens table for JWT management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    user_agent TEXT,
    ip_address INET
);

-- Create user sessions table for session-based auth (alternative to JWT)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- Create login attempts table for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create password history table to prevent reuse
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_email_active ON app_user(email, is_active);

-- Add triggers for password history
CREATE OR REPLACE FUNCTION track_password_history() RETURNS TRIGGER AS $$
BEGIN
    -- Only track if password actually changed
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash AND NEW.password_hash IS NOT NULL THEN
        INSERT INTO password_history(user_id, password_hash)
        VALUES (NEW.id, NEW.password_hash);
        
        -- Keep only last 5 passwords
        DELETE FROM password_history 
        WHERE user_id = NEW.id 
        AND id NOT IN (
            SELECT id FROM password_history 
            WHERE user_id = NEW.id 
            ORDER BY created_at DESC 
            LIMIT 5
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_track_password_history ON app_user;
CREATE TRIGGER trg_track_password_history 
    AFTER UPDATE ON app_user 
    FOR EACH ROW 
    EXECUTE FUNCTION track_password_history();

-- Function to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_auth() RETURNS VOID AS $$
BEGIN
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    
    -- Delete expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Delete old login attempts (keep 30 days)
    DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '30 days';
    
    -- Reset failed login attempts for users not locked
    UPDATE app_user 
    SET failed_login_attempts = 0 
    WHERE locked_until < NOW() OR locked_until IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a view for user authentication info
CREATE OR REPLACE VIEW vw_user_auth AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.email_verified,
    u.password_hash,
    u.failed_login_attempts,
    u.locked_until,
    u.last_login_at,
    u.manager_id,
    manager.name as manager_name,
    u.created_at,
    u.updated_at
FROM app_user u
LEFT JOIN app_user manager ON manager.id = u.manager_id;

-- Create default admin user (password: admin123!)
-- Note: In production, this should be created through a secure setup process
INSERT INTO app_user (name, email, role, password_hash, is_active, email_verified)
VALUES (
    'System Administrator',
    'admin@kanban-app.com',
    'ADMIN',
    -- This is bcrypt hash of 'admin123!' with cost 12
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeED6zqOxjHlXGgKa',
    true,
    true
) ON CONFLICT (email) DO NOTHING;