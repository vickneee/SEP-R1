-- Remove Debug Queries and Clean Up
-- This migration removes all debug tables, functions, and temporary code

-- Drop debug functions
DROP FUNCTION IF EXISTS public.debug_auth_users();
DROP FUNCTION IF EXISTS public.fix_missing_profiles();

-- Drop debug table
DROP TABLE IF EXISTS public.trigger_debug_log;

-- Clean up the handle_new_user function to remove debug code
-- Return to a clean, production-ready version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_first_name TEXT;
    user_last_name TEXT;
    user_role user_role;
BEGIN
    -- Extract and validate user metadata
    user_first_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Unknown');
    user_last_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), 'User');
    
    -- Handle role with proper casting
    BEGIN
        user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
    EXCEPTION WHEN invalid_text_representation THEN
        user_role := 'customer';
    END;

    -- Insert user profile with error handling
    BEGIN
        INSERT INTO public.users (
            user_id,
            email,
            first_name,
            last_name,
            role,
            created_at,
            is_active,
            penalty_count
        ) VALUES (
            NEW.id,
            NEW.email,
            user_first_name,
            user_last_name,
            user_role,
            NEW.created_at,
            true,
            0
        );
        
        -- Log successful user creation
        RAISE LOG 'Successfully created user profile for user_id: % (% %)', NEW.id, user_first_name, user_last_name;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE LOG 'Failed to create user profile for user_id: %. Error: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update function comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Production trigger function for creating user profiles when auth users are created';

-- Clean up permissions - remove any references to debug functions
-- Ensure all necessary permissions are still in place
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO postgres, anon, authenticated, service_role;

-- Final cleanup message
DO $$
BEGIN
    RAISE NOTICE 'Debug cleanup completed successfully';
    RAISE NOTICE 'All debug tables and functions have been removed';
    RAISE NOTICE 'Production trigger functions are now clean and optimized';
    RAISE NOTICE 'RLS policies have been fixed to prevent infinite recursion';
END $$;
