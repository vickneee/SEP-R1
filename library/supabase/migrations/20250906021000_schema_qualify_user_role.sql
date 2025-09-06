-- Qualify enum type references to avoid search_path issues

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first TEXT;
  v_last TEXT;
  v_role public.user_role;
BEGIN
  v_first := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Unknown');
  v_last  := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''),  'User');
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role);
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'customer'::public.user_role;
  END;

  BEGIN
    INSERT INTO public.users (user_id, email, first_name, last_name, role, created_at, is_active, penalty_count)
    VALUES (NEW.id, NEW.email, v_first, v_last, v_role, NEW.created_at, true, 0);
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
BEGIN
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, NULL);
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := NULL;
  END;

  UPDATE public.users u
  SET
    email = COALESCE(NEW.email, u.email),
    first_name = COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), u.first_name),
    last_name  = COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'),  ''), u.last_name),
    role       = COALESCE(v_role, u.role)
  WHERE u.user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- No changes to triggers; redefinition is sufficient

DO $$ BEGIN RAISE NOTICE 'Schema-qualified enum references in auth trigger functions.'; END $$;
