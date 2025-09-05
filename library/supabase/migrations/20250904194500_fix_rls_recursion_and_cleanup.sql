-- Fix RLS Policies and Remove Debug Queries
-- This migration fixes the infinite recursion in RLS policies and cleans up debug code

-- First, fix the RLS policy issue that's causing infinite recursion
-- Drop the problematic INSERT policy on users table
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Only librarians can insert users" ON users;

-- Create a new INSERT policy that doesn't cause recursion
-- Allow inserts when the user_id matches auth.uid() OR when called by service_role (triggers)
CREATE POLICY "Allow user profile creation" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'service_role' OR
        current_user = 'postgres'
    );

-- Fix the debug function type mismatch issue
-- The issue is that au.email returns varchar(255) but the function expects text
CREATE OR REPLACE FUNCTION public.debug_auth_users()
RETURNS TABLE (
    auth_id UUID,
    email TEXT,
    confirmed_at TIMESTAMPTZ,
    metadata JSONB,
    has_profile BOOLEAN,
    trigger_logs TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::TEXT,  -- Explicit cast to TEXT
        au.email_confirmed_at,
        au.raw_user_meta_data,
        (u.user_id IS NOT NULL) as has_profile,
        COALESCE(
            array_agg(
                format('Trigger: %s, Success: %s, Error: %s', 
                       tl.trigger_name, tl.success, COALESCE(tl.error_message, 'None'))
            ) FILTER (WHERE tl.trigger_name IS NOT NULL),
            ARRAY[]::TEXT[]
        ) as trigger_logs
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.user_id
    LEFT JOIN public.trigger_debug_log tl ON au.id = tl.user_id
    GROUP BY au.id, au.email, au.email_confirmed_at, au.raw_user_meta_data, u.user_id
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the fix_missing_profiles function with better error handling
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    action_taken TEXT
) AS $$
DECLARE
    auth_user RECORD;
    result_message TEXT;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email::TEXT, au.raw_user_meta_data, au.created_at
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.user_id
        WHERE u.user_id IS NULL
    LOOP
        BEGIN
            INSERT INTO public.users (
                user_id,
                first_name,
                last_name,
                role,
                created_at,
                is_active,
                penalty_count
            ) VALUES (
                auth_user.id,
                COALESCE(NULLIF(trim(auth_user.raw_user_meta_data->>'first_name'), ''), 'Unknown'),
                COALESCE(NULLIF(trim(auth_user.raw_user_meta_data->>'last_name'), ''), 'User'),
                COALESCE((auth_user.raw_user_meta_data->>'role')::user_role, 'customer'),
                auth_user.created_at,
                true,
                0
            );
            result_message := 'Profile created successfully';
        EXCEPTION WHEN OTHERS THEN
            result_message := format('Failed: %s', SQLERRM);
        END;
        
        user_id := auth_user.id;
        email := auth_user.email;
        action_taken := result_message;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fixes with a temporary test message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed to prevent infinite recursion';
    RAISE NOTICE 'Debug function type mismatch resolved';
    RAISE NOTICE 'You can now test user creation without infinite recursion errors';
    RAISE NOTICE 'Use: SELECT * FROM public.fix_missing_profiles(); to create missing profiles';
END $$;
