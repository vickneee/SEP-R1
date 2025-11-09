-- Initial Clean Schema for Library App
-- Use this as the first (and only) migration when bootstrapping a new Supabase project.
-- It creates enums, tables, policies, triggers, and helper functions required by the app.

-----------------------------
-- Enums
-----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'librarian');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('active', 'returned', 'overdue', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'penalty_status') THEN
    CREATE TYPE penalty_status AS ENUM ('pending', 'paid', 'waived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_language') THEN
    CREATE TYPE user_language AS ENUM ('en', 'ja', 'ru');
  END IF;
END $$;

-----------------------------
-- Tables
-----------------------------
-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  penalty_count INTEGER NOT NULL DEFAULT 0 CHECK (penalty_count >= 0),
  language user_language NOT NULL DEFAULT 'en'
);

-- Books catalog
CREATE TABLE IF NOT EXISTS public.books (
  book_id SERIAL PRIMARY KEY,
  isbn TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  image TEXT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publication_year INTEGER NOT NULL CHECK (publication_year > 0 AND publication_year <= EXTRACT(YEAR FROM NOW())),
  category TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies > 0),
  available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT available_copies_check CHECK (available_copies <= total_copies)
);

-- Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  reservation_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES public.books(book_id) ON DELETE CASCADE,
  reservation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status reservation_status NOT NULL DEFAULT 'active',
  extended BOOLEAN NOT NULL DEFAULT false,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reservations
    ADD COLUMN IF NOT EXISTS extended BOOLEAN NOT NULL DEFAULT false;

-- Penalties
CREATE TABLE IF NOT EXISTS public.penalties (
  penalty_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES public.reservations(reservation_id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  reason TEXT NOT NULL,
  status penalty_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-----------------------------
-- Indexes
-----------------------------
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_available ON public.books(available_copies) WHERE available_copies > 0;
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON public.reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_due_date ON public.reservations(due_date);
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON public.penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON public.penalties(status);

-----------------------------
-- Business logic functions & triggers
-----------------------------
-- Keep books.available_copies in sync with reservations
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE public.books
        SET available_copies = available_copies - 1
        WHERE book_id = NEW.book_id AND available_copies > 0;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No available copies for book_id=%', NEW.book_id;
        END IF;
    END IF;

    -- UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- active -> returned/cancelled
        IF OLD.status = 'active' AND NEW.status IN ('returned','cancelled') THEN
            UPDATE public.books
            SET available_copies = available_copies + 1
            WHERE book_id = NEW.book_id;
        END IF;

        -- returned/cancelled -> active
        IF OLD.status IN ('returned','cancelled') AND NEW.status = 'active' THEN
            UPDATE public.books
            SET available_copies = available_copies - 1
            WHERE book_id = NEW.book_id AND available_copies > 0;
        END IF;
    END IF;

    -- DELETE
    IF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE public.books
        SET available_copies = available_copies + 1
        WHERE book_id = OLD.book_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_book_availability ON public.reservations;
CREATE TRIGGER trigger_update_book_availability
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_book_availability();

-- Touch books.updated_at on update
CREATE OR REPLACE FUNCTION public.update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_books_updated_at ON public.books;
CREATE TRIGGER trigger_update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_books_updated_at();

-- Maintain users.penalty_count
CREATE OR REPLACE FUNCTION public.update_user_penalty_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET penalty_count = penalty_count + 1 WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET penalty_count = GREATEST(penalty_count - 1, 0) WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_penalty_count ON public.penalties;
CREATE TRIGGER trigger_update_user_penalty_count
  AFTER INSERT OR DELETE ON public.penalties
  FOR EACH ROW EXECUTE FUNCTION public.update_user_penalty_count();

-----------------------------
-- Auth triggers: create/update/delete profile
-----------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first TEXT;
  v_last TEXT;
  v_role user_role;
  v_language user_language;

-- Extract and sanitize user metadata
BEGIN
  v_first := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Unknown');
  v_last  := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''),  'User');

  -- Role
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'customer';
  END;

  -- Language
  BEGIN
    v_language := COALESCE((NEW.raw_user_meta_data->>'language')::user_language, 'en');
  EXCEPTION WHEN invalid_text_representation THEN
    v_language := 'en';
  END;

  BEGIN
    INSERT INTO public.users (user_id, email, first_name, last_name, role, created_at, is_active, penalty_count, language)
    VALUES (NEW.id, NEW.email, v_first, v_last, v_role, NEW.created_at, true, 0, v_language);
  EXCEPTION WHEN OTHERS THEN
    -- Do not break auth.users insert; just log
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, NULL);
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

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-----------------------------
-- RLS
-----------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Only librarians can insert users" ON public.users;
CREATE POLICY "Only librarians can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

-- Allow trigger/service role to create profiles at signup
DROP POLICY IF EXISTS "Allow user profile creation" ON public.users;
CREATE POLICY "Allow user profile creation" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.role() = 'service_role' OR
    current_user = 'postgres' OR
    current_user = 'supabase_auth_admin' OR
    auth.uid() IS NULL
  );

-- Books policies
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only librarians can modify books" ON public.books;
CREATE POLICY "Only librarians can modify books" ON public.books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

-- Allow only librarians to insert books
DROP POLICY IF EXISTS "Only librarians can insert books" ON public.books;
CREATE POLICY "Only librarians can insert books" ON public.books
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users me
      WHERE me.user_id = auth.uid() AND me.role = 'librarian'
    )
  );

-- Reservations policies
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations
  FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

-- Default user_id to auth.uid() on insert
ALTER TABLE reservations
    ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;
CREATE POLICY "Users can create own reservations" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reservations, librarians can update all" ON public.reservations;
CREATE POLICY "Users can update own reservations, librarians can update all" ON public.reservations
  FOR UPDATE USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

-- Penalties policies
DROP POLICY IF EXISTS "Users can view own penalties" ON public.penalties;
CREATE POLICY "Users can view own penalties" ON public.penalties
  FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

DROP POLICY IF EXISTS "Only librarians can manage penalties" ON public.penalties;
CREATE POLICY "Only librarians can manage penalties" ON public.penalties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users me WHERE me.user_id = auth.uid() AND me.role = 'librarian')
  );

-----------------------------
-- Helper RPCs
-----------------------------
-- Get complete user profile (matches frontend types)
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
  SELECT u.user_id, au.email, u.first_name, u.last_name, u.role, u.is_active, u.penalty_count, u.created_at
  FROM public.users u
  JOIN auth.users au ON u.user_id = au.id
  WHERE u.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon, service_role, postgres;

-- Optional: manual profile creation helper (matches frontend types)
CREATE OR REPLACE FUNCTION public.create_user_profile_manually(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT 'Unknown',
  p_last_name  TEXT DEFAULT 'User',
  p_role user_role DEFAULT 'customer'
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.users(user_id, email, first_name, last_name, role)
  VALUES (p_user_id, p_email, p_first_name, p_last_name, p_role)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_user_profile_manually(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated, service_role, postgres;

-- Minimal diagnostics to verify deploy health
CREATE OR REPLACE FUNCTION public.debug_health()
RETURNS TABLE (
  user_role_type_exists boolean,
  reservation_status_exists boolean,
  penalty_status_exists boolean,
  public_users_role_udt text,
  auth_users_role_udt text,
  on_auth_user_created_trigger boolean,
  handle_new_user_exists boolean,
  allow_user_profile_creation_policy boolean
) AS $$
BEGIN
  user_role_type_exists := EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role');
  reservation_status_exists := EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status');
  penalty_status_exists := EXISTS (SELECT 1 FROM pg_type WHERE typname = 'penalty_status');
  SELECT col.udt_name INTO public_users_role_udt FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name='users' AND col.column_name='role';
  SELECT col.udt_name INTO auth_users_role_udt FROM information_schema.columns col WHERE col.table_schema='auth' AND col.table_name='users' AND col.column_name='role';
  on_auth_user_created_trigger := EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='auth' AND c.relname='users' AND t.tgname='on_auth_user_created'
  );
  handle_new_user_exists := EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='handle_new_user');
  allow_user_profile_creation_policy := EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Allow user profile creation');
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.debug_health() TO authenticated, anon, service_role, postgres;

-----------------------------
-- Grants
-----------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.books TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.reservations TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.penalties TO postgres, anon, authenticated, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-----------------------------
-- Final notice
-----------------------------
DO $$ BEGIN
  RAISE NOTICE 'Initial clean schema installed: enums, tables, policies, auth triggers, and health RPC ready.';
END $$;
