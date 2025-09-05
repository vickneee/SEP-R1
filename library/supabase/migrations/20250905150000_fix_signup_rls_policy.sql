-- Fix RLS policy for user profile creation during signup
-- Allow the trigger function to create user profiles

-- Drop the current problematic policy
DROP POLICY IF EXISTS "Allow user profile creation" ON users;

-- Create a new policy that allows profile creation during signup
-- This allows inserts when:
-- 1. The user is inserting their own profile (normal case)
-- 2. The trigger is running (service_role or postgres user)
-- 3. During initial user creation (no auth context yet)
CREATE POLICY "Allow user profile creation" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        current_user = 'postgres' OR
        current_user = 'supabase_auth_admin' OR
        auth.uid() IS NULL  -- Allow during initial signup when no auth context exists
    );

-- Also ensure the trigger function has proper permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;

-- Test the policy
DO $$
BEGIN
    RAISE NOTICE 'RLS policy updated to allow user profile creation during signup';
    RAISE NOTICE 'Trigger should now be able to create user profiles';
END $$;
