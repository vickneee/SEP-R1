import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { useRouter } from 'next/navigation';
import BookPageClient from '@/app/book/[id]/BookPageClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/books/bookActions', () => ({
  reserveBook: jest.fn(),
}));

jest.mock('@/app/penalties/penaltyActions', () => ({
  checkUserCanReserve: jest.fn(),
}));

jest.mock('@/components/custom/BookImage', () => {
  return function MockBookImage() {
    return <div>Mock Book Image</div>;
  };
});

jest.mock('@/components/custom/PenaltyBadge', () => {
  return function MockPenaltyBadge({ className }: { className?: string }) {
    return <div className={className}>Penalty Badge</div>;
  };
});

import { reserveBook } from '@/app/books/bookActions';
import { checkUserCanReserve } from '@/app/penalties/penaltyActions';

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockReserveBook = reserveBook as jest.MockedFunction<typeof reserveBook>;
const mockCheckUserCanReserve = checkUserCanReserve as jest.MockedFunction<typeof checkUserCanReserve>;

const mockBook = {
  book_id: 1,
  isbn: '123-456-789',
  title: 'Test Book',
  image: 'https://example.com/image.jpg',
  author: 'Test Author',
  publisher: 'Test Publisher',
  publication_year: 2024,
  category: 'Fiction',
  total_copies: 5,
  available_copies: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockRouterPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({
    push: mockRouterPush,
  } as any);
});

describe('BookPageClient - Penalty Integration', () => {
  it('should allow reservation when user has no penalties', async () => {
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      },
      error: null,
    });

    mockReserveBook.mockResolvedValue({
      success: true,
      data: { reservation_id: 1 },
    });

    render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByText('Reserve this Book')).toBeInTheDocument();
    });

    // Should not show penalty badge
    expect(screen.queryByText('Penalty Badge')).not.toBeInTheDocument();

    // Click reserve button
    fireEvent.click(screen.getByText('Reserve this Book'));

    await waitFor(() => {
      expect(mockReserveBook).toHaveBeenCalled();
    });
  });

  it('should prevent reservation and show penalty badge when user has penalties', async () => {
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 2,
        pending_penalty_amount: 10.00,
        restriction_reason: 'You have 2 pending penalty(ies) totaling $10.00. Please pay your penalties to continue borrowing books.',
      },
      error: null,
    });

    render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByText('Cannot Reserve (Pending Penalties)')).toBeInTheDocument();
      expect(screen.getByText('Penalty Badge')).toBeInTheDocument();
    });

    // Button should be disabled
    const button = screen.getByText('Cannot Reserve (Pending Penalties)');
    expect(button).toBeDisabled();

    // Should not call reserve function when clicked
    fireEvent.click(button);
    expect(mockReserveBook).not.toHaveBeenCalled();
  });

  it('should show loading state while checking penalties', async () => {
    mockCheckUserCanReserve.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BookPageClient book={mockBook} />);

    expect(screen.getByText('Checking eligibility...')).toBeInTheDocument();
  });

  it('should handle penalty check errors gracefully', async () => {
    mockCheckUserCanReserve.mockResolvedValue({
      status: null,
      error: 'Failed to check penalties',
    });

    render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByText('Reserve this Book')).toBeInTheDocument();
    });
  });

  it('should show restriction message when trying to reserve with penalties', async () => {
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 5.00,
        restriction_reason: 'You have 1 pending penalty totaling $5.00. Please pay your penalties to continue borrowing books.',
      },
      error: null,
    });

    render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      const button = screen.getByText('Cannot Reserve (Pending Penalties)');
      expect(button).toBeDisabled();
    });

    // Try to click anyway (shouldn't work)
    const button = screen.getByText('Cannot Reserve (Pending Penalties)');
    fireEvent.click(button);

    expect(mockReserveBook).not.toHaveBeenCalled();
  });

  it('should show penalty badge only when user has penalties', async () => {
    // First render without penalties
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      },
      error: null,
    });

    const { rerender } = render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.queryByText('Penalty Badge')).not.toBeInTheDocument();
    });

    // Re-render with penalties
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 3.00,
        restriction_reason: 'You have penalties',
      },
      error: null,
    });

    rerender(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByText('Penalty Badge')).toBeInTheDocument();
    });
  });

  it('should handle unavailable book correctly regardless of penalty status', async () => {
    const unavailableBook = { ...mockBook, available_copies: 0 };

    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      },
      error: null,
    });

    render(<BookPageClient book={unavailableBook} />);

    await waitFor(() => {
      expect(screen.getByText('Checked out')).toBeInTheDocument();
    });

    const button = screen.getByText('Checked out');
    expect(button).toBeDisabled();
  });

  it('should display penalty restriction message in the UI', async () => {
    const restrictionMessage = 'You have 3 pending penalties totaling $15.00. Please pay your penalties to continue borrowing books.';

    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 3,
        pending_penalty_amount: 15.00,
        restriction_reason: restrictionMessage,
      },
      error: null,
    });

    render(<BookPageClient book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByText('Cannot Reserve (Pending Penalties)')).toBeInTheDocument();
      expect(screen.getByText('Penalty Badge')).toBeInTheDocument();
    });
  });
});