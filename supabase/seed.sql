-- Seed data for Library App
-- This file populates the database with initial books and users for development/testing

-----------------------------
-- Seed Books
-----------------------------
INSERT INTO public.books (isbn, title, image, author, publisher, publication_year, category, total_copies,
                          available_copies)
VALUES
-- Fiction
('978-0-547-92822-7', 'The Hobbit', 'https://m.media-amazon.com/images/I/81uEDUfKBZL._SL1500_.jpg', 'J.R.R. Tolkien',
 'Houghton Mifflin Harcourt', 1937, 'Fiction', 3, 3),
('978-0-7432-7356-5', 'To Kill a Mockingbird', 'https://m.media-amazon.com/images/I/81aY1lxk+9L._SL1500_.jpg',
 'Harper Lee', 'J. B. Lippincott & Co.', 1960, 'Fiction', 2, 2),
('978-0-452-28423-4', '1984',
 'https://www.suomalainen.com/cdn/shop/files/9789510505830_1-vuonna-1984.jpg?v=1743690167&width=950', 'George Orwell',
 'Secker & Warburg', 1949, 'Fiction', 4, 4),
('978-0-7434-7679-3', 'The Great Gatsby', 'https://m.media-amazon.com/images/I/81TLiZrasVL._SL1500_.jpg',
 'F. Scott Fitzgerald', 'Charles Scribner''s Sons', 1925, 'Fiction', 2, 2),
('978-0-316-76948-0', 'The Catcher in the Rye', 'https://m.media-amazon.com/images/I/81TRBjfC5fL._SL1500_.jpg',
 'J.D. Salinger', 'Little, Brown and Company', 1951, 'Fiction', 2, 2),

-- Non-Fiction
('978-1-60309-025-4', 'Sapiens: A Brief History of Humankind',
 'https://m.media-amazon.com/images/I/716E6dQ4BXL._SL1500_.jpg', 'Yuval Noah Harari', 'Harvill Secker', 2014,
 'Non-Fiction', 3, 3),
('978-0-7432-7357-2', 'The Immortal Life of Henrietta Lacks',
 'https://www.univ.ox.ac.uk/wp-content/uploads/2018/11/The-Immortal-Life-of-Henrietta-Lacks.jpg', 'Rebecca Skloot',
 'Crown Publishing Group', 2010, 'Non-Fiction', 2, 2),
('978-0-307-38789-9', 'Educated', 'https://m.media-amazon.com/images/I/71-4MkLN5jL._SL1500_.jpg', 'Tara Westover',
 'Random House', 2018, 'Non-Fiction', 2, 2),

-- Science & Technology
('978-0-262-03384-8', 'Introduction to Algorithms', 'https://m.media-amazon.com/images/I/61Mw06x2XcL._SL1500_.jpg',
 'Thomas H. Cormen', 'MIT Press', 2009, 'Computer Science', 2, 2),
('978-0-13-235088-4', 'Clean Code', 'https://m.media-amazon.com/images/I/71nj3JM-igL._SL1500_.jpg', 'Robert C. Martin',
 'Prentice Hall', 2008, 'Computer Science', 3, 3),
('978-0-596-51774-8', 'JavaScript: The Good Parts', 'https://m.media-amazon.com/images/I/7185IMvz88L._SL1500_.jpg',
 'Douglas Crockford', 'O''Reilly Media', 2008, 'Computer Science', 2, 2),
('978-1-449-31884-7', 'Learning React', 'https://m.media-amazon.com/images/I/91uFdkCJmAL._SL1500_.jpg', 'Alex Banks',
 'O''Reilly Media', 2020, 'Computer Science', 2, 2),

-- History
('978-0-679-64115-3', 'A People''s History of the United States',
 'https://m.media-amazon.com/images/I/71Zb-D8NaGL._SL1500_.jpg', 'Howard Zinn', 'Harper & Row', 1980, 'History', 2, 2),
('978-0-14-303943-3', 'The Guns of August', 'https://m.media-amazon.com/images/I/71vkxIftlzL._SL1500_.jpg',
 'Barbara Tuchman', 'Macmillan', 1962, 'History', 1, 1),

-- Science
('978-0-553-10953-5', 'A Brief History of Time', 'https://m.media-amazon.com/images/I/91ebghaV-eL._SL1500_.jpg',
 'Stephen Hawking', 'Bantam Spectra', 1988, 'Science', 2, 2),
('978-0-14-027740-9', 'The Selfish Gene', 'https://m.media-amazon.com/images/I/61dtRkUbfRL._SL1338_.jpg',
 'Richard Dawkins', 'Oxford University Press', 1976, 'Science', 2, 2) ON CONFLICT (isbn) DO NOTHING;

-----------------------------
-- Seed Test Users (for development only)
-----------------------------
-- Note: These are test users with known UUIDs for development
-- In production, users would be created through the auth system

-- Insert test librarian (if not exists)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
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
        '') ON CONFLICT (id) DO NOTHING;

-- Insert test customer (if not exists)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
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
        '') ON CONFLICT (id) DO NOTHING;

-- Insert another normal customer (if not exists)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
        '55555555-5555-5555-5555-555555555555',
        'authenticated',
        'authenticated',
        'normal.customer@library.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Alice", "last_name": "Normal", "role": "customer"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '') ON CONFLICT (id) DO NOTHING;

-- Insert customer with penalties (for testing)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
        '33333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'penalty.user@library.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Sarah", "last_name": "Overdue", "role": "customer"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '') ON CONFLICT (id) DO NOTHING;

-- Insert another customer with different penalty scenarios
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
        '44444444-4444-4444-4444-444444444444',
        'authenticated',
        'authenticated',
        'multiple.penalties@library.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Mike", "last_name": "Penalties", "role": "customer"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '') ON CONFLICT (id) DO NOTHING;

-- Insert another penalty customer (for testing)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
        '66666666-6666-6666-6666-666666666666',
        'authenticated',
        'authenticated',
        'another.penalty@library.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Bob", "last_name": "Penalty", "role": "customer"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '') ON CONFLICT (id) DO NOTHING;

-- Insert Russian-speaking customer (if not exists)
INSERT INTO auth.users (instance_id,
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
                        recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',
        '77777777-7777-7777-7777-777777777777',
        'authenticated',
        'authenticated',
        'иван.петров@пример.ком',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Иван", "last_name": "Петров", "role": "customer", "language": "ru"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '') ON CONFLICT (id) DO NOTHING;

-- Insert Japanese-speaking customer (if not exists)
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
             '88888888-8888-8888-8888-888888888888',
             'authenticated',
             'authenticated',
             'ユキ.タナカ@例え.日本',
             crypt('password123', gen_salt('bf')),
             NOW(),
             NOW(),
             NOW(),
             '{"provider": "email", "providers": ["email"]}',
             '{"first_name": "ユキ", "last_name": "タナカ", "role": "customer", "language": "ja"}',
             NOW(),
             NOW(),
             '',
             '',
             '',
             ''
         ) ON CONFLICT (id) DO NOTHING;

-- The public.users entries should be created automatically by the handle_new_user trigger,
-- But let's ensure they exist (handle_new_user might not trigger during seed)
INSERT INTO public.users (user_id, email, first_name, last_name, role, is_active, penalty_count, language)
VALUES ('11111111-1111-1111-1111-111111111111', 'librarian@library.com', 'Admin', 'Librarian', 'librarian', true, 0, 'en'),
       ('22222222-2222-2222-2222-222222222222', 'customer@library.com', 'John', 'Customer', 'customer', true, 0, 'en'),
       ('33333333-3333-3333-3333-333333333333', 'penalty.user@library.com', 'Sarah', 'Overdue', 'customer', true, 2, 'en'),
       ('44444444-4444-4444-4444-444444444444', 'multiple.penalties@library.com', 'Mike', 'Penalties', 'customer', true,
        3, 'en'),
       ('55555555-5555-5555-5555-555555555555', 'normal.customer@library.com', 'Alice', 'Normal', 'customer', true, 0, 'en'),
       ('66666666-6666-6666-6666-666666666666', 'another.penalty@library.com', 'Bob', 'Penalty', 'customer', true,
        1, 'en'),
       ('77777777-7777-7777-7777-777777777777', 'ivan.petrov@library.com', 'Иван', 'Петров', 'customer', true, 0, 'ru'),
       ('88888888-8888-8888-8888-888888888888', 'yuki.tanaka@library.com', 'ユキ', 'タナカ', 'customer', true, 0, 'ja')
    ON CONFLICT (user_id) DO NOTHING;


-----------------------------
-- Seed Sample Reservations and Penalties (for testing)
-----------------------------
-- Before inserting reservations
UPDATE public.books
SET available_copies = total_copies;

-- Regular customer (John) - has some active reservations, no penalties
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, status, extended)
VALUES ('22222222-2222-2222-2222-222222222222', 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', 'active',
        false),
       ('22222222-2222-2222-2222-222222222222', 3, NOW() - INTERVAL '3 days', NOW() + INTERVAL '11 days', 'active',
        false) ON CONFLICT DO NOTHING;

-- Alice Normal - has one active reservation, no penalties
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, status, extended)
VALUES ('55555555-5555-5555-5555-555555555555', 9, NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', 'active',
        false) ON CONFLICT DO NOTHING;

-- Sarah Overdue - has overdue reservations with penalties
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, return_date, status, extended)
VALUES
-- Currently overdue book (5 days overdue) - should generate penalty - status 'active' so buttons show
('33333333-3333-3333-3333-333333333333', 4, NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', NULL, 'active',
 false),
-- Previously overdue book that was returned late (returned 3 days late)
('33333333-3333-3333-3333-333333333333', 5, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days',
 NOW() - INTERVAL '12 days', 'returned', false) ON CONFLICT DO NOTHING;

-- Mike Penalties - has multiple penalty scenarios
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, return_date, status, extended)
VALUES
-- Very overdue book (10 days overdue) - status 'active' so buttons show
('44444444-4444-4444-4444-444444444444', 6, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', NULL, 'active',
 false),
-- Returned late book (was 7 days late)
('44444444-4444-4444-4444-444444444444', 7, NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days',
 NOW() - INTERVAL '11 days', 'returned', false),
-- Recently overdue (2 days overdue) - status 'active' so buttons show
('44444444-4444-4444-4444-444444444444', 8, NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days', NULL, 'active',
 false) ON CONFLICT DO NOTHING;

-- Bob Penalty - has one overdue reservation
INSERT INTO public.reservations (user_id, book_id, reservation_date, due_date, return_date, status, extended)
VALUES ('66666666-6666-6666-6666-666666666666', 10, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NULL,
        'active', false) ON CONFLICT DO NOTHING;

-- Insert corresponding overdue tracking records (no payment amounts)
INSERT INTO public.penalties (user_id, reservation_id, amount, reason, status, created_at)
VALUES
-- Sarah's overdue tracking
('33333333-3333-3333-3333-333333333333',
 (SELECT reservation_id
  FROM public.reservations
  WHERE user_id = '33333333-3333-3333-3333-333333333333'
    AND book_id = 4 LIMIT 1), 0.00, 'Overdue book: "The Great Gatsby" (5 days overdue)', 'pending', NOW() - INTERVAL '4 days'
    ), (
    '33333333-3333-3333-3333-333333333333', (SELECT reservation_id FROM public.reservations WHERE user_id = '33333333-3333-3333-3333-333333333333' AND book_id = 5 LIMIT 1), 0.00, 'Overdue book: "The Catcher in the Rye" (returned 3 days late)', 'waived', NOW() - INTERVAL '15 days'
    ),

-- Mike's overdue tracking (multiple scenarios)
    (
    '44444444-4444-4444-4444-444444444444', (SELECT reservation_id FROM public.reservations WHERE user_id = '44444444-4444-4444-4444-444444444444' AND book_id = 6 LIMIT 1), 0.00, 'Overdue book: "Sapiens: A Brief History of Humankind" (10 days overdue)', 'pending', NOW() - INTERVAL '9 days'
    ), (
    '44444444-4444-4444-4444-444444444444', (SELECT reservation_id FROM public.reservations WHERE user_id = '44444444-4444-4444-4444-444444444444' AND book_id = 7 LIMIT 1), 0.00, 'Overdue book: "The Immortal Life of Henrietta Lacks" (returned 7 days late)', 'waived', NOW() - INTERVAL '20 days'
    ), (
    '44444444-4444-4444-4444-444444444444', (SELECT reservation_id FROM public.reservations WHERE user_id = '44444444-4444-4444-4444-444444444444' AND book_id = 8 LIMIT 1), 0.00, 'Overdue book: "Educated" (2 days overdue)', 'pending', NOW() - INTERVAL '1 days'
    ),

-- Bob's overdue tracking
    (
    '66666666-6666-6666-6666-666666666666', (SELECT reservation_id FROM public.reservations WHERE user_id = '66666666-6666-6666-6666-666666666666' AND book_id = 10 LIMIT 1), 0.00, 'Overdue book: "The Guns of August" (3 days overdue)', 'pending', NOW() - INTERVAL '2 days'
    )
ON CONFLICT DO NOTHING;

-- Update available copies to reflect the active reservations
-- The returned books should have their copies restored automatically via triggers
-- Note: All overdue books now use 'active' status, so only checking 'active'
UPDATE public.books
SET available_copies = GREATEST(0, available_copies - (SELECT COUNT(*)
                                                       FROM public.reservations
                                                       WHERE book_id = public.books.book_id
                                                         AND status = 'active'))
WHERE book_id IN (1, 3, 4, 6, 8, 9, 10);

-- Update penalty counts based on overdue books (should be handled by triggers, but ensuring consistency)
-- Note: Overdue books now use 'active' status with past due dates - UI determines visual status
UPDATE public.users
SET penalty_count = (SELECT COUNT(*)
                     FROM public.reservations
                     WHERE user_id = public.users.user_id
                       AND status = 'active'
                       AND due_date < NOW())
WHERE user_id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
                  '66666666-6666-6666-6666-666666666666');

-----------------------------
-- Test scenario summary
-----------------------------
-- Test Users Created:
-- 1. librarian@library.com (Admin Librarian) - Can manage overdue books and mark as returned
-- 2. customer@library.com (John Customer) - Normal user, no overdue books
-- 3. normal.customer@library.com (Alice Normal) - Normal user, no overdue books
-- 4. penalty.user@library.com (Sarah Overdue) - Has 1 overdue book: "The Great Gatsby"
-- 5. multiple.penalties@library.com (Mike Penalties) - Has 2 overdue books: "Sapiens" & "Educated"
-- 6. another.penalty@library.com (Bob Penalty) - Has 1 overdue book: "The Guns of August"
--
-- Restriction Scenarios:
-- - Sarah: Cannot reserve new books (1 overdue book must be returned)
-- - Mike: Cannot reserve new books (2 overdue books must be returned)
-- - Bob: Cannot reserve new books (1 overdue book must be returned)
-- - John & Alice: Can reserve books normally
--
-- Books with Test Reservations (visible in "My Books"):
-- - Book IDs 1,3: Reserved by John (active - due dates in future)
-- - Book ID 9: Reserved by Alice (active - due dates in future)
-- - Book ID 4: Reserved by Sarah (active status, overdue due date - "The Great Gatsby") - buttons visible
-- - Book ID 5: Previously reserved by Sarah (returned late - "The Catcher in the Rye")
-- - Book ID 6: Reserved by Mike (active status, overdue due date - "Sapiens") - buttons visible
-- - Book ID 7: Previously reserved by Mike (returned late - "Henrietta Lacks")
-- - Book ID 8: Reserved by Mike (active status, overdue due date - "Educated") - buttons visible
-- - Book ID 10: Reserved by Bob (active status, overdue due date - "The Guns of August") - buttons visible

-----------------------------
-- Success message
-----------------------------
DO
$$
BEGIN
    RAISE NOTICE 'Seed data inserted: % books, 4 test users (2 with overdue books), sample reservations for UI testing',
        (SELECT COUNT(*) FROM public.books);
    RAISE
NOTICE 'Test accounts: librarian@library.com, customer@library.com, penalty.user@library.com (1 overdue), multiple.penalties@library.com (2 overdue) - all password: password123';
    RAISE
NOTICE 'System now tracks overdue books rather than payment penalties. Users must return overdue books to continue borrowing.';
END $$;
