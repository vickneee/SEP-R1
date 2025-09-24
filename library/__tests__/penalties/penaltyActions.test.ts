import { jest } from '@jest/globals';
import {
  getUserPenalties,
  checkUserCanReserve,
  payPenalty,
  waivePenalty,
  getAllPenalties,
  processOverdueBooks
} from '@/app/penalties/penaltyActions';

// Mock the supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        order: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
    rpc: jest.fn(),
  })),
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
  rpc: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  // Reset default mocks
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null,
  });
});

describe('penaltyActions', () => {
  describe('getUserPenalties', () => {
    it('should fetch user penalties successfully', async () => {
      const mockPenalties = [
        {
          penalty_id: 1,
          reservation_id: 1,
          amount: 5.00,
          reason: 'Overdue book',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
          book_title: 'Test Book',
          book_author: 'Test Author',
          due_date: '2024-01-01T00:00:00Z',
          return_date: null,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockPenalties,
        error: null,
      });

      const result = await getUserPenalties();

      expect(result.penalties).toEqual(mockPenalties);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_penalties', {
        user_uuid: 'test-user-id',
      });
    });

    it('should handle errors when fetching penalties', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getUserPenalties();

      expect(result.penalties).toBeNull();
      expect(result.error).toBe('Database error');
    });

    it('should handle user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserPenalties();

      expect(result.penalties).toBeNull();
      expect(result.error).toBe('User not authenticated');
    });

    it('should fetch penalties for specific user ID', async () => {
      const specificUserId = 'specific-user-id';
      const mockPenalties = [];

      mockSupabase.rpc.mockResolvedValue({
        data: mockPenalties,
        error: null,
      });

      const result = await getUserPenalties(specificUserId);

      expect(result.penalties).toEqual(mockPenalties);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_penalties', {
        user_uuid: specificUserId,
      });
    });
  });

  describe('checkUserCanReserve', () => {
    it('should return can reserve when user has no penalties', async () => {
      const mockStatus = {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockStatus],
        error: null,
      });

      const result = await checkUserCanReserve();

      expect(result.status).toEqual(mockStatus);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('can_user_reserve_books', {
        user_uuid: 'test-user-id',
      });
    });

    it('should return cannot reserve when user has pending penalties', async () => {
      const mockStatus = {
        can_reserve: false,
        pending_penalty_count: 2,
        pending_penalty_amount: 10.00,
        restriction_reason: 'You have 2 pending penalty(ies) totaling $10.00. Please pay your penalties to continue borrowing books.',
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockStatus],
        error: null,
      });

      const result = await checkUserCanReserve();

      expect(result.status).toEqual(mockStatus);
      expect(result.error).toBeNull();
    });

    it('should handle RPC errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const result = await checkUserCanReserve();

      expect(result.status).toBeNull();
      expect(result.error).toBe('RPC error');
    });
  });

  describe('payPenalty', () => {
    beforeEach(() => {
      // Mock librarian user
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'librarian' },
              error: null,
            })),
          })),
        })),
      });
    });

    it('should pay penalty successfully when user is librarian', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await payPenalty(1);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('pay_penalty', {
        penalty_uuid: 1,
      });
    });

    it('should reject when user is not librarian', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'customer' },
              error: null,
            })),
          })),
        })),
      });

      const result = await payPenalty(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only librarians can manage penalties');
    });

    it('should handle RPC errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Payment failed' },
      });

      const result = await payPenalty(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment failed');
    });
  });

  describe('waivePenalty', () => {
    beforeEach(() => {
      // Mock librarian user
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'librarian' },
              error: null,
            })),
          })),
        })),
      });
    });

    it('should waive penalty successfully when user is librarian', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await waivePenalty(1);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('waive_penalty', {
        penalty_uuid: 1,
      });
    });

    it('should reject when user is not librarian', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'customer' },
              error: null,
            })),
          })),
        })),
      });

      const result = await waivePenalty(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only librarians can manage penalties');
    });
  });

  describe('processOverdueBooks', () => {
    beforeEach(() => {
      // Mock librarian user
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'librarian' },
              error: null,
            })),
          })),
        })),
      });
    });

    it('should process overdue books successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 5,
        error: null,
      });

      const result = await processOverdueBooks();

      expect(result.processed_count).toBe(5);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('process_overdue_books');
    });

    it('should reject when user is not librarian', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'customer' },
              error: null,
            })),
          })),
        })),
      });

      const result = await processOverdueBooks();

      expect(result.processed_count).toBe(0);
      expect(result.error).toBe('Only librarians can process overdue books');
    });

    it('should handle RPC errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Processing failed' },
      });

      const result = await processOverdueBooks();

      expect(result.processed_count).toBe(0);
      expect(result.error).toBe('Processing failed');
    });
  });
});