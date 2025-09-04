-- Fix Auth Integration Trigger
-- This migration fixes the auth trigger with better error handling and permissions

-- Drop existing triggers to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Improved function to handle new user creation
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
        
        -- Log successful user creation
        RAISE LOG 'Successfully created user profile for user_id: %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE LOG 'Failed to create user profile for user_id: %. Error: %', NEW.id, SQLERRM;
        -- In development, you might want to raise the exception to debug
        -- RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
    user_first_name TEXT;
    user_last_name TEXT;
    user_role user_role;
BEGIN
    -- Only proceed if user_meta_data actually changed
    IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
        
        -- Extract updated metadata
        user_first_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), OLD.raw_user_meta_data->>'first_name');
        user_last_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), OLD.raw_user_meta_data->>'last_name');
        
        -- Handle role with proper casting
        BEGIN
            user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, (OLD.raw_user_meta_data->>'role')::user_role, 'customer');
        EXCEPTION WHEN invalid_text_representation THEN
            user_role := 'customer';
        END;

        -- Update user profile
        BEGIN
            UPDATE public.users
            SET
                first_name = user_first_name,
                last_name = user_last_name,
                role = user_role
            WHERE user_id = NEW.id;
            
            RAISE LOG 'Successfully updated user profile for user_id: %', NEW.id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to update user profile for user_id: %. Error: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        DELETE FROM public.users WHERE user_id = OLD.id;
        RAISE LOG 'Successfully deleted user profile for user_id: %', OLD.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to delete user profile for user_id: %. Error: %', OLD.id, SQLERRM;
    END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Ensure proper permissions (critical for triggers to work)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO postgres, anon, authenticated, service_role;

-- Test function to manually create user profile (for debugging)
CREATE OR REPLACE FUNCTION public.create_user_profile_manually(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT 'Test',
    p_last_name TEXT DEFAULT 'User',
    p_role user_role DEFAULT 'customer'
)
RETURNS BOOLEAN AS $$
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
        p_user_id,
        p_first_name,
        p_last_name,
        p_role,
        NOW(),
        true,
        0
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Manual user creation failed for %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_user_profile_manually(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated;

-- Add some helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Improved trigger function with error handling for new auth users';
COMMENT ON FUNCTION public.create_user_profile_manually(UUID, TEXT, TEXT, TEXT, user_role) IS 'Manual function to create user profiles for debugging';