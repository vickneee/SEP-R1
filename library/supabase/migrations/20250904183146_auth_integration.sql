-- Auth Integration Migration
-- This migration adds automatic user profile creation when auth users are created

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract user metadata
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
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    NEW.created_at,
    true,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates from auth
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile when auth user metadata changes
  UPDATE public.users
  SET
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
    role = COALESCE((NEW.raw_user_meta_data->>'role')::user_role, role)
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when auth user is updated
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion from auth
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete user profile when auth user is deleted
  DELETE FROM public.users WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when auth user is deleted
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- Update RLS policies to ensure users can see their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

-- Allow authenticated users to insert their own profile (needed for the trigger)
DROP POLICY IF EXISTS "Only librarians can insert users" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

-- Function to get user profile with auth data
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role user_role,
    is_active BOOLEAN,
    penalty_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        au.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.penalty_count,
        u.created_at
    FROM public.users u
    JOIN auth.users au ON u.user_id = au.id
    WHERE u.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_profile TO authenticated;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile when a new auth user is created';
COMMENT ON FUNCTION public.handle_user_update() IS 'Updates user profile when auth user metadata changes';
COMMENT ON FUNCTION public.handle_user_delete() IS 'Cleans up user profile when auth user is deleted';
COMMENT ON FUNCTION public.get_user_profile(UUID) IS 'Gets complete user profile with auth and profile data';