-- Penalty System Implementation
-- This migration adds automatic penalty creation for overdue books and reservation restrictions

-----------------------------
-- Configuration
-----------------------------
-- Configurable penalty settings (can be moved to a config table later)
CREATE OR REPLACE FUNCTION public.get_penalty_config(config_key TEXT)
RETURNS DECIMAL AS $$
BEGIN
  CASE config_key
    WHEN 'daily_penalty_amount' THEN RETURN 1.00;
    WHEN 'grace_period_days' THEN RETURN 1.0;
    ELSE RETURN 0.0;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------
-- Utility Functions
-----------------------------
-- Check if a user has pending penalties
CREATE OR REPLACE FUNCTION public.user_has_pending_penalties(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.penalties
    WHERE user_id = user_uuid AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate penalty amount for overdue days
CREATE OR REPLACE FUNCTION public.calculate_penalty_amount(overdue_days INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  daily_amount DECIMAL;
  grace_days DECIMAL;
BEGIN
  daily_amount := public.get_penalty_config('daily_penalty_amount');
  grace_days := public.get_penalty_config('grace_period_days');

  -- No penalty if within grace period
  IF overdue_days <= grace_days THEN
    RETURN 0.00;
  END IF;

  -- Calculate penalty excluding grace period
  RETURN daily_amount * (overdue_days - grace_days);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------
-- Penalty Management Functions
-----------------------------
-- Function to create penalty for overdue reservation
CREATE OR REPLACE FUNCTION public.create_overdue_penalty(reservation_uuid INTEGER)
RETURNS VOID AS $$
DECLARE
  res_record RECORD;
  overdue_days INTEGER;
  penalty_amount DECIMAL;
  penalty_reason TEXT;
BEGIN
  -- Get reservation details
  SELECT r.*, b.title
  INTO res_record
  FROM public.reservations r
  JOIN public.books b ON r.book_id = b.book_id
  WHERE r.reservation_id = reservation_uuid;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate overdue days
  overdue_days := EXTRACT(DAY FROM NOW() - res_record.due_date)::INTEGER;

  -- Skip if not actually overdue
  IF overdue_days <= 0 THEN
    RETURN;
  END IF;

  -- Calculate penalty amount
  penalty_amount := public.calculate_penalty_amount(overdue_days);

  -- Skip if no penalty due to grace period
  IF penalty_amount <= 0 THEN
    RETURN;
  END IF;

  -- Create penalty reason
  penalty_reason := 'Overdue book: "' || res_record.title || '" (' || overdue_days || ' days overdue)';

  -- Check if penalty already exists for this reservation
  IF EXISTS (
    SELECT 1 FROM public.penalties
    WHERE reservation_id = reservation_uuid
  ) THEN
    -- Update existing penalty amount
    UPDATE public.penalties
    SET amount = penalty_amount,
        reason = penalty_reason
    WHERE reservation_id = reservation_uuid;
  ELSE
    -- Insert new penalty
    INSERT INTO public.penalties (user_id, reservation_id, amount, reason, status)
    VALUES (res_record.user_id, reservation_uuid, penalty_amount, penalty_reason, 'pending');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-resolve penalty when book is returned early
CREATE OR REPLACE FUNCTION public.resolve_penalty_on_return(reservation_uuid INTEGER)
RETURNS VOID AS $$
DECLARE
  grace_days DECIMAL;
  actual_overdue_days INTEGER;
  res_due_date TIMESTAMPTZ;
  res_return_date TIMESTAMPTZ;
BEGIN
  -- Get reservation dates
  SELECT due_date, return_date
  INTO res_due_date, res_return_date
  FROM public.reservations
  WHERE reservation_id = reservation_uuid;

  IF NOT FOUND OR res_return_date IS NULL THEN
    RETURN;
  END IF;

  grace_days := public.get_penalty_config('grace_period_days');
  actual_overdue_days := EXTRACT(DAY FROM res_return_date - res_due_date)::INTEGER;

  -- If returned within grace period, waive the penalty
  IF actual_overdue_days <= grace_days THEN
    UPDATE public.penalties
    SET status = 'waived'
    WHERE reservation_id = reservation_uuid AND status = 'pending';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------
-- Triggers
-----------------------------
-- Trigger to automatically mark reservations as overdue and create penalties
CREATE OR REPLACE FUNCTION public.handle_overdue_reservations()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process active reservations that become overdue
  IF NEW.status = 'active' AND NEW.due_date < NOW() THEN
    -- Mark as overdue
    NEW.status := 'overdue';

    -- Create penalty (will be handled by separate scheduled job in practice)
    PERFORM public.create_overdue_penalty(NEW.reservation_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle penalty resolution when book is returned
CREATE OR REPLACE FUNCTION public.handle_book_return()
RETURNS TRIGGER AS $$
BEGIN
  -- When a book is returned
  IF OLD.status != 'returned' AND NEW.status = 'returned' THEN
    -- Try to resolve penalty if returned within grace period
    PERFORM public.resolve_penalty_on_return(NEW.reservation_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_handle_overdue_reservations ON public.reservations;
CREATE TRIGGER trigger_handle_overdue_reservations
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  WHEN (OLD.status = 'active' AND NEW.due_date < NOW())
  EXECUTE FUNCTION public.handle_overdue_reservations();

DROP TRIGGER IF EXISTS trigger_handle_book_return ON public.reservations;
CREATE TRIGGER trigger_handle_book_return
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_book_return();

-----------------------------
-- RPC Functions for Application
-----------------------------
-- Get user penalties with book details
CREATE OR REPLACE FUNCTION public.get_user_penalties(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  penalty_id INTEGER,
  reservation_id INTEGER,
  amount DECIMAL,
  reason TEXT,
  status penalty_status,
  created_at TIMESTAMPTZ,
  book_title TEXT,
  book_author TEXT,
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.penalty_id,
    p.reservation_id,
    p.amount,
    p.reason,
    p.status,
    p.created_at,
    b.title as book_title,
    b.author as book_author,
    r.due_date,
    r.return_date
  FROM public.penalties p
  LEFT JOIN public.reservations r ON p.reservation_id = r.reservation_id
  LEFT JOIN public.books b ON r.book_id = b.book_id
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can make new reservations
CREATE OR REPLACE FUNCTION public.can_user_reserve_books(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  can_reserve BOOLEAN,
  pending_penalty_count INTEGER,
  pending_penalty_amount DECIMAL,
  restriction_reason TEXT
) AS $$
DECLARE
  penalty_count INTEGER;
  penalty_total DECIMAL;
BEGIN
  -- Count pending penalties
  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(amount), 0)::DECIMAL
  INTO penalty_count, penalty_total
  FROM public.penalties
  WHERE user_id = user_uuid AND status = 'pending';

  IF penalty_count > 0 THEN
    RETURN QUERY SELECT
      FALSE as can_reserve,
      penalty_count as pending_penalty_count,
      penalty_total as pending_penalty_amount,
      'You have ' || penalty_count || ' pending penalty(ies) totaling $' || penalty_total || '. Please pay your penalties to continue borrowing books.' as restriction_reason;
  ELSE
    RETURN QUERY SELECT
      TRUE as can_reserve,
      0 as pending_penalty_count,
      0::DECIMAL as pending_penalty_amount,
      NULL::TEXT as restriction_reason;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Librarian function to pay penalty
CREATE OR REPLACE FUNCTION public.pay_penalty(penalty_uuid INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  is_librarian BOOLEAN;
BEGIN
  -- Check if user is librarian
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND role = 'librarian'
  ) INTO is_librarian;

  IF NOT is_librarian THEN
    RAISE EXCEPTION 'Only librarians can manage penalties';
  END IF;

  -- Update penalty status
  UPDATE public.penalties
  SET status = 'paid'
  WHERE penalty_id = penalty_uuid AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Librarian function to waive penalty
CREATE OR REPLACE FUNCTION public.waive_penalty(penalty_uuid INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  is_librarian BOOLEAN;
BEGIN
  -- Check if user is librarian
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND role = 'librarian'
  ) INTO is_librarian;

  IF NOT is_librarian THEN
    RAISE EXCEPTION 'Only librarians can manage penalties';
  END IF;

  -- Update penalty status
  UPDATE public.penalties
  SET status = 'waived'
  WHERE penalty_id = penalty_uuid AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch process to create penalties for overdue books (to be called by cron job)
CREATE OR REPLACE FUNCTION public.process_overdue_books()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  reservation_record RECORD;
BEGIN
  -- Find all active reservations that are overdue
  FOR reservation_record IN
    SELECT reservation_id
    FROM public.reservations
    WHERE status = 'active'
    AND due_date < NOW() - INTERVAL '1 hour' -- Add buffer to avoid edge cases
  LOOP
    -- Update status to overdue
    UPDATE public.reservations
    SET status = 'overdue'
    WHERE reservation_id = reservation_record.reservation_id;

    -- Create penalty
    PERFORM public.create_overdue_penalty(reservation_record.reservation_id);

    processed_count := processed_count + 1;
  END LOOP;

  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------
-- Grants
-----------------------------
GRANT EXECUTE ON FUNCTION public.get_user_penalties(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_reserve_books(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_penalty(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.waive_penalty(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_overdue_books() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_pending_penalties(UUID) TO authenticated;

-----------------------------
-- Final notice
-----------------------------
DO $$ BEGIN
  RAISE NOTICE 'Penalty system implemented: triggers, functions, and policies ready.';
END $$;