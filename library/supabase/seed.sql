-- Seed data for Library App
-- This file populates the database with initial books and users for development/testing

-----------------------------
-- Seed Books
-----------------------------
INSERT INTO public.books (isbn, title, image, author, publisher, publication_year, category, total_copies, available_copies) VALUES
-- Fiction
('978-0-547-92822-7', 'The Hobbit', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'J.R.R. Tolkien', 'Houghton Mifflin Harcourt', 1937, 'Fiction', 3, 3),
('978-0-7432-7356-5', 'To Kill a Mockingbird', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'Harper Lee', 'J. B. Lippincott & Co.', 1960, 'Fiction', 2, 2),
('978-0-452-28423-4', '1984', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400', 'George Orwell', 'Secker & Warburg', 1949, 'Fiction', 4, 4),
('978-0-7434-7679-3', 'The Great Gatsby', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'F. Scott Fitzgerald', 'Charles Scribner''s Sons', 1925, 'Fiction', 2, 2),
('978-0-316-76948-0', 'The Catcher in the Rye', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'J.D. Salinger', 'Little, Brown and Company', 1951, 'Fiction', 2, 2),

-- Non-Fiction
('978-1-60309-025-4', 'Sapiens: A Brief History of Humankind', 'https://images.unsplash.com/photo-1471023492977-0681a21d4ee9?w=400', 'Yuval Noah Harari', 'Harvill Secker', 2014, 'Non-Fiction', 3, 3),
('978-0-7432-7357-2', 'The Immortal Life of Henrietta Lacks', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'Rebecca Skloot', 'Crown Publishing Group', 2010, 'Non-Fiction', 2, 2),
('978-0-307-38789-9', 'Educated', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'Tara Westover', 'Random House', 2018, 'Non-Fiction', 2, 2),

-- Science & Technology
('978-0-262-03384-8', 'Introduction to Algorithms', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Thomas H. Cormen', 'MIT Press', 2009, 'Computer Science', 2, 2),
('978-0-13-235088-4', 'Clean Code', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', 'Robert C. Martin', 'Prentice Hall', 2008, 'Computer Science', 3, 3),
('978-0-596-51774-8', 'JavaScript: The Good Parts', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400', 'Douglas Crockford', 'O''Reilly Media', 2008, 'Computer Science', 2, 2),
('978-1-449-31884-7', 'Learning React', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', 'Alex Banks', 'O''Reilly Media', 2020, 'Computer Science', 2, 2),

-- History
('978-0-679-64115-3', 'A People''s History of the United States', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', 'Howard Zinn', 'Harper & Row', 1980, 'History', 2, 2),
('978-0-14-303943-3', 'The Guns of August', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', 'Barbara Tuchman', 'Macmillan', 1962, 'History', 1, 1),

-- Science
('978-0-553-10953-5', 'A Brief History of Time', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400', 'Stephen Hawking', 'Bantam Spectra', 1988, 'Science', 2, 2),
('978-0-14-027740-9', 'The Selfish Gene', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Richard Dawkins', 'Oxford University Press', 1976, 'Science', 2, 2)

ON CONFLICT (isbn) DO NOTHING;

-----------------------------
-- Seed Test Users (for development only)
-----------------------------
-- Note: These are test users with known UUIDs for development
-- In production, users would be created through the auth system

-- Insert test librarian (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'librarian@library.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "Librarian", "role": "librarian"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert test customer (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'customer@library.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "John", "last_name": "Customer", "role": "customer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- The public.users entries should be created automatically by the handle_new_user trigger
-- But let's ensure they exist (handle_new_user might not trigger during seed)
INSERT INTO public.users (user_id, email, first_name, last_name, role, is_active, penalty_count) VALUES
('11111111-1111-1111-1111-111111111111', 'librarian@library.com', 'Admin', 'Librarian', 'librarian', true, 0),
('22222222-2222-2222-2222-222222222222', 'customer@library.com', 'John', 'Customer', 'customer', true, 0)
ON CONFLICT (user_id) DO NOTHING;

-----------------------------
-- Seed Some Sample Reservations (for testing)
-----------------------------
-- Customer has reserved a couple of books
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, status) VALUES
('22222222-2222-2222-2222-222222222222', 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', 'active'),
('22222222-2222-2222-2222-222222222222', 3, NOW() - INTERVAL '3 days', NOW() + INTERVAL '11 days', 'active')
ON CONFLICT DO NOTHING;

-- Update available copies to reflect the reservations
-- (This should happen automatically via trigger, but let's ensure consistency)
UPDATE public.books SET available_copies = available_copies - 1 WHERE book_id IN (1, 3);

-----------------------------
-- Success message
-----------------------------
DO $$ BEGIN
    RAISE NOTICE 'Seed data inserted: % books, 2 test users, and sample reservations', 
        (SELECT COUNT(*) FROM public.books);
END $$;