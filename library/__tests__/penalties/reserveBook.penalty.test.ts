import { jest } from '@jest/globals';
import { reserveBook } from '@/app/books/bookActions';

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
  rpc: jest.fn(),
};

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

describe('reserveBook - Penalty Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Default successful book availability check
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { available_copies: 1 },
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { reservation_id: 123 },
            error: null,
          })),
        })),
      })),
    });
  });

  it('should successfully reserve book when user has no penalties', async () => {
    // Mock successful penalty check
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      }],
      error: null,
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ reservation_id: 123 });
    expect(mockSupabase.rpc).toHaveBeenCalledWith('can_user_reserve_books', {
      user_uuid: 'test-user-id',
    });
  });

  it('should prevent reservation when user has pending penalties', async () => {
    // Mock penalty restriction
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: false,
        pending_penalty_count: 2,
        pending_penalty_amount: 10.00,
        restriction_reason: 'You have 2 pending penalty(ies) totaling $10.00. Please pay your penalties to continue borrowing books.',
      }],
      error: null,
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual(new Error('You have 2 pending penalty(ies) totaling $10.00. Please pay your penalties to continue borrowing books.'));

    // Should not attempt to insert reservation
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  it('should handle penalty check RPC error', async () => {
    // Mock RPC error
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual(new Error('Failed to verify reservation eligibility'));

    // Should not attempt to insert reservation
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  it('should handle missing penalty check data', async () => {
    // Mock empty penalty check response
    mockSupabase.rpc.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual(new Error('You cannot make reservations at this time'));
  });

  it('should handle user authentication failure', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'User not authenticated' },
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual({ message: 'User not authenticated' });

    // Should not check penalties or make reservation
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  it('should proceed with reservation after successful penalty check', async () => {
    // Mock successful penalty check
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      }],
      error: null,
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    // Should check penalties first
    expect(mockSupabase.rpc).toHaveBeenCalledWith('can_user_reserve_books', {
      user_uuid: 'test-user-id',
    });

    // Should check book availability
    expect(mockSupabase.from).toHaveBeenCalledWith('books');

    // Should create reservation
    expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
      book_id: 1,
      due_date: '2024-12-31T00:00:00Z',
      user_id: 'test-user-id',
    }]);

    expect(result.success).toBe(true);
  });

  it('should handle book availability check failure', async () => {
    // Mock successful penalty check
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      }],
      error: null,
    });

    // Mock book availability check failure
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Book not found' },
          })),
        })),
      })),
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual({ message: 'Book not found' });
  });

  it('should handle reservation insertion failure', async () => {
    // Mock successful penalty check
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      }],
      error: null,
    });

    // Mock reservation insertion failure
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { available_copies: 1 },
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Reservation failed' },
          })),
        })),
      })),
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual({ message: 'Reservation failed' });
  });

  it('should use default restriction message when none provided', async () => {
    // Mock penalty restriction without specific message
    mockSupabase.rpc.mockResolvedValue({
      data: [{
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 5.00,
        restriction_reason: null,
      }],
      error: null,
    });

    const result = await reserveBook(1, '2024-12-31T00:00:00Z');

    expect(result.success).toBe(false);
    expect(result.error).toEqual(new Error('You cannot make reservations at this time'));
  });
});