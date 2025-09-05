-- Initial Library Management System Schema
-- This migration creates all the necessary tables for a library management system

-- Create enum types
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
END $$;

-- USERS table
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    penalty_count INTEGER NOT NULL DEFAULT 0 CHECK (penalty_count >= 0)
);

-- BOOKS table
-- Catalog of all books in the library
CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    isbn TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
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

-- RESERVATIONS table
-- Tracks book reservations and loans
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    reservation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status reservation_status NOT NULL DEFAULT 'active',
    reminder_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PENALTIES table
-- Tracks fines and penalties for users
CREATE TABLE IF NOT EXISTS penalties (
    penalty_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reservation_id INTEGER REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    reason TEXT NOT NULL,
    status penalty_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available_copies) WHERE available_copies > 0;
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_due_date ON reservations(due_date);
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON penalties(status);

-- Function to update book availability when reservations change
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- When a new reservation is made, decrease available copies
        IF NEW.status = 'active' THEN
            UPDATE books 
            SET available_copies = available_copies - 1 
            WHERE book_id = NEW.book_id;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- When reservation status changes
        IF OLD.status = 'active' AND NEW.status IN ('returned', 'cancelled') THEN
            -- Book is returned or reservation cancelled, increase available copies
            UPDATE books 
            SET available_copies = available_copies + 1 
            WHERE book_id = NEW.book_id;
        ELSIF OLD.status IN ('returned', 'cancelled') AND NEW.status = 'active' THEN
            -- Reactivating a reservation, decrease available copies
            UPDATE books 
            SET available_copies = available_copies - 1 
            WHERE book_id = NEW.book_id;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- When a reservation is deleted
        IF OLD.status = 'active' THEN
            UPDATE books 
            SET available_copies = available_copies + 1 
            WHERE book_id = OLD.book_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update book availability
DROP TRIGGER IF EXISTS trigger_update_book_availability ON reservations;
CREATE TRIGGER trigger_update_book_availability
    AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_book_availability();

-- Function to update books updated_at timestamp
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update books updated_at
DROP TRIGGER IF EXISTS trigger_update_books_updated_at ON books;
CREATE TRIGGER trigger_update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_books_updated_at();

-- Function to update user penalty count
CREATE OR REPLACE FUNCTION update_user_penalty_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase penalty count when new penalty is added
        UPDATE users 
        SET penalty_count = penalty_count + 1 
        WHERE user_id = NEW.user_id;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- No change in penalty count on status update
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- Decrease penalty count when penalty is deleted
        UPDATE users 
        SET penalty_count = GREATEST(penalty_count - 1, 0)
        WHERE user_id = OLD.user_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user penalty count
DROP TRIGGER IF EXISTS trigger_update_user_penalty_count ON penalties;
CREATE TRIGGER trigger_update_user_penalty_count
    AFTER INSERT OR DELETE ON penalties
    FOR EACH ROW EXECUTE FUNCTION update_user_penalty_count();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile, librarians can see all profiles
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

DROP POLICY IF EXISTS "Only librarians can insert users" ON users;
CREATE POLICY "Only librarians can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

-- Books are publicly readable, only librarians can modify
DROP POLICY IF EXISTS "Anyone can view books" ON books;
CREATE POLICY "Anyone can view books" ON books
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only librarians can modify books" ON books;
CREATE POLICY "Only librarians can modify books" ON books
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

-- Users can see their own reservations, librarians can see all
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

DROP POLICY IF EXISTS "Users can create own reservations" ON reservations;
CREATE POLICY "Users can create own reservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reservations, librarians can update all" ON reservations;
CREATE POLICY "Users can update own reservations, librarians can update all" ON reservations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

-- Users can see their own penalties, librarians can see all
DROP POLICY IF EXISTS "Users can view own penalties" ON penalties;
CREATE POLICY "Users can view own penalties" ON penalties
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );

DROP POLICY IF EXISTS "Only librarians can manage penalties" ON penalties;
CREATE POLICY "Only librarians can manage penalties" ON penalties
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'librarian')
    );