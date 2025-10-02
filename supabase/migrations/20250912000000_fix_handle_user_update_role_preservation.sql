-- Fix: Do not overwrite public.users.role from auth.users metadata on login updates
-- Context: Logging in updates auth.users (e.g., last_sign_in_at), firing handle_user_update.
-- If raw_user_meta_data.role remained 'customer' from signup, it was downgrading librarians back to 'customer'.
-- Solution: Stop propagating role changes from auth.users to public.users on update; keep role managed in public.users only.

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Parse metadata defensively (kept for potential future use), but do not apply to role.
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, NULL);
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := NULL;
  END;

  UPDATE public.users u
  SET
    email = COALESCE(NEW.email, u.email),
    first_name = COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), u.first_name),
    last_name  = COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'),  ''), u.last_name)
    -- role       = u.role  -- Intentionally NOT updating role from auth metadata
  WHERE u.user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN RAISE NOTICE 'Updated handle_user_update(): role no longer overwritten from auth metadata.'; END $$;