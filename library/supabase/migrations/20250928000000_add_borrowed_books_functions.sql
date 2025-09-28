-- Borrowed System Implementation

-- Get user borrowed with book details
CREATE OR REPLACE FUNCTION public.get_user_borrowed(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  reservation_id INTEGER,
  created_at TIMESTAMPTZ,
  book_title TEXT,
  book_author TEXT,
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  extended BOOLEAN,
  status public.reservation_status
) AS $$
BEGIN
RETURN QUERY
SELECT
    r.reservation_id,
    r.created_at,
    b.title as book_title,
    b.author as book_author,
    r.due_date,
    r.return_date,
    r.extended,
    r.status
FROM public.reservations r
         LEFT JOIN public.books b ON r.book_id = b.book_id
WHERE r.user_id = user_uuid
ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get all borrowed books for librarian management
CREATE OR REPLACE FUNCTION public.get_all_borrowed_books()
RETURNS TABLE (
  reservation_id INTEGER,
  user_name TEXT,
  user_email TEXT,
  book_title TEXT,
  book_author TEXT,
  due_date TIMESTAMPTZ,
  extended BOOLEAN,
  status public.reservation_status,
  user_id UUID
) AS $$
BEGIN
RETURN QUERY
SELECT
    r.reservation_id,
    (u.first_name || ' ' || u.last_name) as user_name,
    u.email as user_email,
    b.title as book_title,
    b.author as book_author,
    r.due_date,
    r.extended,
    r.status,
    r.user_id
FROM public.reservations r
         JOIN public.users u ON r.user_id = u.user_id
         JOIN public.books b ON r.book_id = b.book_id
WHERE r.status = 'active'
ORDER BY r.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Extend a reservation due date and mark extended = true
CREATE OR REPLACE FUNCTION public.extend_reservation(p_reservation_id int)
RETURNS void AS $$
BEGIN
UPDATE public.reservations
SET due_date = due_date + interval '7 days',  -- extend by 7 days
    extended = true
WHERE reservation_id = p_reservation_id
  AND extended = false; -- only if not already extended
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------
-- Grants
-----------------------------
GRANT EXECUTE ON FUNCTION public.get_user_borrowed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_borrowed_books() TO authenticated;

-----------------------------
-- Final notice
-----------------------------
DO $$ BEGIN
  RAISE NOTICE 'Borrowed books implementation.';
END $$;
