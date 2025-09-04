-- Debug Migration: Check trigger execution and auth users

-- Create a debug table to track trigger executions
CREATE TABLE IF NOT EXISTS public.trigger_debug_log (
    id SERIAL PRIMARY KEY,
    trigger_name TEXT NOT NULL,
    user_id UUID,
    user_email TEXT,
    user_metadata JSONB,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions on debug table
GRANT ALL ON public.trigger_debug_log TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE trigger_debug_log_id_seq TO postgres, anon, authenticated, service_role;

-- Enhanced debug version of handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_first_name TEXT;
    user_last_name TEXT;
    user_role user_role;
    debug_message TEXT;
BEGIN
    -- Log trigger execution
    INSERT INTO public.trigger_debug_log (trigger_name, user_id, user_email, user_metadata, success)
    VALUES ('handle_new_user', NEW.id, NEW.email, NEW.raw_user_meta_data, false);
    
    -- Extract and validate user metadata
    user_first_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Unknown');
    user_last_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), 'User');
    
    -- Handle role with proper casting
    BEGIN
        user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
    EXCEPTION WHEN invalid_text_representation THEN
        user_role := 'customer';
    END;

    -- Log extracted data
    debug_message := format('Extracted data: first_name=%s, last_name=%s, role=%s', 
                           user_first_name, user_last_name, user_role);

    -- Insert user profile with error handling
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
            NEW.id,
            user_first_name,
            user_last_name,
            user_role,
            NEW.created_at,
            true,
            0
        );
        
        -- Update debug log with success
        UPDATE public.trigger_debug_log 
        SET success = true, error_message = debug_message
        WHERE user_id = NEW.id AND trigger_name = 'handle_new_user';
        
        -- Log successful user creation
        RAISE LOG 'Successfully created user profile for user_id: % (% %)', NEW.id, user_first_name, user_last_name;
        
    EXCEPTION WHEN OTHERS THEN
        -- Update debug log with error
        UPDATE public.trigger_debug_log 
        SET error_message = format('ERROR: %s | Debug: %s', SQLERRM, debug_message)
        WHERE user_id = NEW.id AND trigger_name = 'handle_new_user';
        
        -- Log the error but don't fail the auth user creation
        RAISE LOG 'Failed to create user profile for user_id: %. Error: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check auth users and debug info
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
        au.email,
        au.email_confirmed_at,
        au.raw_user_meta_data,
        (u.user_id IS NOT NULL) as has_profile,
        array_agg(
            format('Trigger: %s, Success: %s, Error: %s', 
                   tl.trigger_name, tl.success, tl.error_message)
        ) as trigger_logs
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.user_id
    LEFT JOIN public.trigger_debug_log tl ON au.id = tl.user_id
    GROUP BY au.id, au.email, au.email_confirmed_at, au.raw_user_meta_data, u.user_id
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.debug_auth_users() TO authenticated, postgres;

-- Function to manually trigger profile creation for existing auth users
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
        SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
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

GRANT EXECUTE ON FUNCTION public.fix_missing_profiles() TO authenticated, postgres;

-- Add helpful comments
COMMENT ON TABLE public.trigger_debug_log IS 'Debug table to track trigger executions';
COMMENT ON FUNCTION public.debug_auth_users() IS 'Debug function to check auth users and their profiles';
COMMENT ON FUNCTION public.fix_missing_profiles() IS 'Function to manually create missing user profiles';

-- Test the current state
DO $$
BEGIN
    RAISE NOTICE 'Debug migration applied. Use these functions to debug:';
    RAISE NOTICE '1. SELECT * FROM public.debug_auth_users();';
    RAISE NOTICE '2. SELECT * FROM public.fix_missing_profiles();';
    RAISE NOTICE '3. SELECT * FROM public.trigger_debug_log ORDER BY created_at DESC;';
END $$;