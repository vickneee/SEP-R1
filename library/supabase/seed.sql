-- Seed data for Library Management System
-- This file contains sample data for testing and development

-- Sample Books
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies) VALUES
-- Fiction
('978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Fiction', 3, 3),
('978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 1960, 'Fiction', 2, 2),
('978-0-14-143951-8', '1984', 'George Orwell', 'Secker & Warburg', 1949, 'Fiction', 4, 4),
('978-0-7434-7679-3', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown and Company', 1951, 'Fiction', 2, 2),
('978-0-452-28423-4', 'Brave New World', 'Aldous Huxley', 'Chatto & Windus', 1932, 'Fiction', 3, 3),

-- Non-Fiction
('978-0-385-50420-4', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'Harvill Secker', 2014, 'Non-Fiction', 5, 5),
('978-0-7432-7357-2', 'The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 'Crown Publishers', 2010, 'Non-Fiction', 2, 2),
('978-0-385-49081-8', 'Educated', 'Tara Westover', 'Random House', 2018, 'Non-Fiction', 3, 3),
('978-1-5011-4403-3', 'Becoming', 'Michelle Obama', 'Crown Publishing', 2018, 'Biography', 4, 4),

-- Science & Technology
('978-0-553-10953-5', 'A Brief History of Time', 'Stephen Hawking', 'Bantam Books', 1988, 'Science', 3, 3),
('978-0-385-49081-9', 'The Code Book', 'Simon Singh', 'Doubleday', 1999, 'Technology', 2, 2),
('978-0-307-88885-4', 'The Elegant Universe', 'Brian Greene', 'W. W. Norton & Company', 1999, 'Science', 2, 2),

-- Computer Science & Programming
('978-0-201-61622-4', 'The Pragmatic Programmer', 'David Thomas and Andrew Hunt', 'Addison-Wesley', 1999, 'Computer Science', 3, 3),
('978-0-13-235088-4', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Computer Science', 4, 4),
('978-0-596-52068-7', 'JavaScript: The Good Parts', 'Douglas Crockford', 'O''Reilly Media', 2008, 'Computer Science', 2, 2),
('978-1-59327-584-6', 'Python Crash Course', 'Eric Matthes', 'No Starch Press', 2015, 'Computer Science', 3, 3),

-- History
('978-0-14-303943-3', 'Guns, Germs, and Steel', 'Jared Diamond', 'W. W. Norton & Company', 1997, 'History', 2, 2),
('978-0-679-64115-3', 'The Guns of August', 'Barbara Tuchman', 'Macmillan', 1962, 'History', 2, 2),

-- Literature & Classics
('978-0-14-044913-6', 'Pride and Prejudice', 'Jane Austen', 'T. Egerton', 1813, 'Literature', 3, 3),
('978-0-14-243724-7', 'Jane Eyre', 'Charlotte Brontë', 'Smith, Elder & Co.', 1847, 'Literature', 2, 2),
('978-0-486-27061-0', 'Frankenstein', 'Mary Shelley', 'Lackington, Hughes, Harding, Mavor & Jones', 1818, 'Literature', 2, 2),

-- Self-Help & Psychology
('978-1-5011-2201-1', 'Atomic Habits', 'James Clear', 'Avery', 2018, 'Self-Help', 5, 5),
('978-0-7432-6734-2', 'How to Win Friends and Influence People', 'Dale Carnegie', 'Simon & Schuster', 1936, 'Self-Help', 3, 3),
('978-0-679-72113-5', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Farrar, Straus and Giroux', 2011, 'Psychology', 3, 3),

-- Business & Economics
('978-0-06-251509-1', 'The Lean Startup', 'Eric Ries', 'Crown Business', 2011, 'Business', 2, 2),
('978-0-06-256541-2', 'Good to Great', 'Jim Collins', 'HarperBusiness', 2001, 'Business', 2, 2),
('978-0-14-312701-1', 'Freakonomics', 'Steven D. Levitt and Stephen J. Dubner', 'William Morrow', 2005, 'Economics', 2, 2);

-- Display summary of seeded data
DO $$
BEGIN
    RAISE NOTICE 'Seeding completed successfully!';
    RAISE NOTICE 'Books inserted: %', (SELECT COUNT(*) FROM books);
    RAISE NOTICE '';
    RAISE NOTICE 'To add sample users, reservations, and penalties:';
    RAISE NOTICE '1. Create users through your application''s auth system';
    RAISE NOTICE '2. Insert user profiles into the users table';
    RAISE NOTICE '3. Create sample reservations and penalties as needed';
END $$;