import { render, screen, act, waitFor } from '../utils/test-utils';
import EditBookPage from '@/app/[locale]/book/edit/[bookId]/EditBookPage';
import * as bookActions from '@/app/[locale]/books/bookActions';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useParams: jest.fn().mockReturnValue({ locale: 'en' })
}));

jest.mock('@/app/[locale]/books/bookActions', () => ({
  getBookById: jest.fn(),
  updateBook: jest.fn(),
}));

global.alert = jest.fn();

const mockUserProfile = {
  created_at: '2024-01-01T00:00:00Z',
  email: 'librarian@example.com',
  first_name: 'John',
  last_name: 'Doe',
  is_active: true,
  penalty_count: 0,
  role: 'librarian' as const,
  user_id: 'user123',
};

const mockBook = {
  book_id: 1,
  title: 'Test Book',
  author: 'Test Author',
  image: 'https://example.com/image.jpg',
  category: 'Fiction',
  isbn: '978-1234567890',
  publisher: 'Test Publisher',
  publication_year: 2023,
  total_copies: 5,
  available_copies: 3,
};

describe('EditBookPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bookActions.getBookById as jest.Mock).mockResolvedValue({
      book: mockBook,
      error: null,
    });
    (bookActions.updateBook as jest.Mock).mockResolvedValue({
      book: mockBook,
      error: null,
    });
  });

  it('renders with user profile and book data', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Librarian Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/librarian@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Title')).toHaveValue(mockBook.title);
    expect(screen.getByPlaceholderText('Author')).toHaveValue(mockBook.author);
    expect(screen.getByPlaceholderText('ISBN')).toHaveValue(mockBook.isbn);
  });

  it('displays loading state initially', () => {
    render(
      <EditBookPage
        userProfile={mockUserProfile}
        userEmail={mockUserProfile.email}
        bookId="1"
      />
    );

    expect(screen.getByText('loading_book_data')).toBeInTheDocument();
  });

  it('shows penalty count when greater than 0', async () => {
    const profileWithPenalty = { ...mockUserProfile, penalty_count: 3 };

    await act(async () => {
      render(
        <EditBookPage
          userProfile={profileWithPenalty}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Penalties:/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show penalty count when it is 0', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/Penalties:/i)).not.toBeInTheDocument();
  });

  it('loads book data on mount', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(bookActions.getBookById).toHaveBeenCalledWith(1);
    });
  });

  it('handles book fetch error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (bookActions.getBookById as jest.Mock).mockResolvedValue({
        book: null,
        error: 'Book not found',
    });

    await act(async () => {
        render(
            <EditBookPage
                userProfile={mockUserProfile}
                userEmail={mockUserProfile.email}
                bookId="1"
            />
        );
    });

    await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('error_fetch_book');
    });

    consoleErrorSpy.mockRestore();
});

it('renders all form fields with correct values', async () => {
    await act(async () => {
        render(
            <EditBookPage
                userProfile={mockUserProfile}
                userEmail={mockUserProfile.email}
                bookId="1"
            />
        );
    });

    await waitFor(() => {
        expect(screen.getByPlaceholderText('Title')).toHaveValue(mockBook.title);
        expect(screen.getByPlaceholderText('Author')).toHaveValue(mockBook.author);
        expect(screen.getByPlaceholderText('Category')).toHaveValue(mockBook.category);
        expect(screen.getByPlaceholderText('ISBN')).toHaveValue(mockBook.isbn);
        expect(screen.getByPlaceholderText('Publisher')).toHaveValue(mockBook.publisher);
        expect(screen.getByPlaceholderText('Publication Year:')).toHaveValue(mockBook.publication_year);
        expect(screen.getByPlaceholderText('Total Copies:')).toHaveValue(mockBook.total_copies);
        expect(screen.getByPlaceholderText('Available Copies:')).toHaveValue(mockBook.available_copies);
    });
});

  it('displays form labels', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Publication Year:')).toBeInTheDocument();
    expect(screen.getByText('Total Copies:')).toBeInTheDocument();
    expect(screen.getByText('Available Copies:')).toBeInTheDocument();
  });

  it('renders Update Book and Cancel buttons', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Update Book/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('displays user status correctly', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays inactive status when user is not active', async () => {
    const inactiveProfile = { ...mockUserProfile, is_active: false };

    await act(async () => {
      render(
        <EditBookPage
          userProfile={inactiveProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('displays Edit Book heading', async () => {
    await act(async () => {
      render(
        <EditBookPage
          userProfile={mockUserProfile}
          userEmail={mockUserProfile.email}
          bookId="1"
        />
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading book data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Edit Book')).toBeInTheDocument();
  });
});
