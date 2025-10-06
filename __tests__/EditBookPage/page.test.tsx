import { redirect } from 'next/navigation';
import EditBookRoute from '@/app/book/edit/[bookId]/page';
import { createClient } from '@/utils/supabase/server';
import EditBookPage from '@/app/book/edit/[bookId]/EditBookPage';

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url) => {
    throw new Error(`Redirect to ${url}`);
  }),
}));

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/app/book/edit/[bookId]/EditBookPage', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Edit Book Page</div>),
}));

describe('EditBookRoute', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

  interface MockSupabaseClient {
    auth: {
      getUser: jest.Mock;
    };
    from: jest.Mock;
  }

  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    } as MockSupabaseClient;

    mockCreateClient.mockResolvedValue(mockSupabase as any);
  });

  describe('Authentication', () => {
    it('should redirect to /signin when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const props = { params: Promise.resolve({ bookId: '123' }) };

      await expect(EditBookRoute(props)).rejects.toThrow('Redirect to /signin');
      expect(mockRedirect).toHaveBeenCalledWith('/signin');
    });

    it('should successfully proceed (not redirect) when user is authenticated and authorized', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'librarian@example.com',
      };

      const mockUserProfile = {
        user_id: 'user-123',
        role: 'librarian',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '123' }) };

      const result = await EditBookRoute(props);

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();

      expect(result.type).toBe(EditBookPage);
      expect(result.props.bookId).toBe('123');
    });
  });

  describe('Authorization', () => {
    it('should redirect to / when user profile does not exist (e.g., first-time user)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '123' }) };

      await expect(EditBookRoute(props)).rejects.toThrow('Redirect to /');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to / when user role is not librarian', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      const mockUserProfile = {
        user_id: 'user-123',
        role: 'member',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '123' }) };

      await expect(EditBookRoute(props)).rejects.toThrow('Redirect to /');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('should allow access when user is a librarian', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'librarian@example.com',
      };

      const mockUserProfile = {
        user_id: 'user-123',
        role: 'librarian',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '123' }) };

      const result = await EditBookRoute(props);

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result.type).toBe(EditBookPage);
      expect(result.props.bookId).toBe('123');
    });
  });

  describe('Component Rendering', () => {
    it('should render EditBookPage with correct props', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'librarian@example.com',
      };

      const mockUserProfile = {
        user_id: 'user-123',
        role: 'librarian',
        name: 'Test Librarian',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '456' }) };

      const result = await EditBookRoute(props);

      expect(result.type).toBe(EditBookPage);
      expect(result.props).toEqual({
        userProfile: mockUserProfile,
        userEmail: 'librarian@example.com',
        bookId: '456',
      });
    });

    it('should handle missing user email gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: undefined,
      };

      const mockUserProfile = {
        user_id: 'user-123',
        role: 'librarian',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: '789' }) };

      const result = await EditBookRoute(props);

      expect(result.type).toBe(EditBookPage);
      expect(result.props).toEqual({
        userProfile: mockUserProfile,
        userEmail: '',
        bookId: '789',
      });
    });
  });

  describe('Database Queries', () => {
    it('should query user profile with correct user_id', async () => {
      const mockUser = {
        id: 'user-xyz',
        email: 'librarian@example.com',
      };

      const mockUserProfile = {
        user_id: 'user-xyz',
        role: 'librarian',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockUserProfile,
          error: null,
        }),
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from = mockFrom;

      const props = { params: Promise.resolve({ bookId: '123' }) };

      await EditBookRoute(props);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-xyz');
    });
  });

  describe('Params Handling', () => {
    it('should correctly extract bookId from params', async () => {
      const mockUser = { id: 'user-123', email: 'librarian@example.com' };
      const mockUserProfile = { user_id: 'user-123', role: 'librarian' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      const props = { params: Promise.resolve({ bookId: 'book-abc-123' }) };

      const result = await EditBookRoute(props);

      expect(result.type).toBe(EditBookPage);
      expect(result.props).toEqual(
        expect.objectContaining({
          bookId: 'book-abc-123',
        })
      );
    });
  });
});
