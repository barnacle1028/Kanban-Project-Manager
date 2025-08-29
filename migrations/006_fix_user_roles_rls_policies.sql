-- Migration: Fix User Roles RLS Policies for Public Access
-- Date: 2025-08-29
-- Purpose: Allow access to user_roles table when not using Supabase auth

-- Option 1: Disable RLS temporarily for user_roles (quick fix)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Option 2: Alternative - Create permissive policy for user_roles (if you want to keep RLS enabled)
-- DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
-- DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
-- 
-- -- Allow all users to view user roles (read-only public access)
-- CREATE POLICY "Public can view user roles" ON user_roles
--     FOR SELECT USING (true);
-- 
-- -- Allow authenticated users to manage user roles
-- CREATE POLICY "Authenticated users can manage user roles" ON user_roles
--     FOR ALL USING (
--         -- Allow if any authenticated user exists (not requiring specific auth.uid())
--         EXISTS (SELECT 1 FROM users WHERE is_active = true LIMIT 1)
--     );

-- Also disable RLS for role assignments to avoid similar issues
ALTER TABLE user_role_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_change_logs DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the change
COMMENT ON TABLE user_roles IS 'RLS disabled to allow frontend access without Supabase auth. Re-enable when implementing proper authentication.';
COMMENT ON TABLE user_role_assignments IS 'RLS disabled to allow frontend access without Supabase auth. Re-enable when implementing proper authentication.';
COMMENT ON TABLE user_role_change_logs IS 'RLS disabled to allow frontend access without Supabase auth. Re-enable when implementing proper authentication.';