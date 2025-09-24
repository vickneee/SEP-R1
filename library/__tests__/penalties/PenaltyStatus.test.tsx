import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import PenaltyStatus from '@/components/custom/PenaltyStatus';

// Mock the penalty actions
jest.mock('@/app/penalties/penaltyActions', () => ({
  getUserPenalties: jest.fn(),
  checkUserCanReserve: jest.fn(),
}));

import { getUserPenalties, checkUserCanReserve } from '@/app/penalties/penaltyActions';

const mockGetUserPenalties = getUserPenalties as jest.MockedFunction<typeof getUserPenalties>;
const mockCheckUserCanReserve = checkUserCanReserve as jest.MockedFunction<typeof checkUserCanReserve>;

describe('PenaltyStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockGetUserPenalties.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockCheckUserCanReserve.mockImplementation(() => new Promise(() => {}));

    render(<PenaltyStatus showDetails={true} />);

    expect(screen.getByText('Loading penalties...')).toBeInTheDocument();
  });

  it('should render no penalties message when user has no penalties', async () => {
    mockGetUserPenalties.mockResolvedValue({
      penalties: [],
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('✓ No outstanding penalties')).toBeInTheDocument();
    });
  });

  it('should render penalty summary when user has pending penalties', async () => {
    const mockPenalties = [
      {
        penalty_id: 1,
        reservation_id: 1,
        amount: 5.00,
        reason: 'Overdue book: "Test Book" (3 days overdue)',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        book_title: 'Test Book',
        book_author: 'Test Author',
        due_date: '2024-01-01T00:00:00Z',
        return_date: null,
      },
      {
        penalty_id: 2,
        reservation_id: 2,
        amount: 3.00,
        reason: 'Overdue book: "Another Book" (2 days overdue)',
        status: 'pending' as const,
        created_at: '2024-01-02T00:00:00Z',
        book_title: 'Another Book',
        book_author: 'Another Author',
        due_date: '2024-01-02T00:00:00Z',
        return_date: null,
      },
    ];

    mockGetUserPenalties.mockResolvedValue({
      penalties: mockPenalties,
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 2,
        pending_penalty_amount: 8.00,
        restriction_reason: 'You have 2 pending penalty(ies) totaling $8.00. Please pay your penalties to continue borrowing books.',
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('penalties')).toBeInTheDocument();
      expect(screen.getByText('$8.00')).toBeInTheDocument();
    });

    // Check for restriction warning
    expect(screen.getByText(/You have 2 pending penalty/)).toBeInTheDocument();
  });

  it('should show penalty details modal when View Details is clicked', async () => {
    const mockPenalties = [
      {
        penalty_id: 1,
        reservation_id: 1,
        amount: 5.00,
        reason: 'Overdue book: "Test Book" (3 days overdue)',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        book_title: 'Test Book',
        book_author: 'Test Author',
        due_date: '2024-01-01T00:00:00Z',
        return_date: null,
      },
    ];

    mockGetUserPenalties.mockResolvedValue({
      penalties: mockPenalties,
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 5.00,
        restriction_reason: 'You have 1 pending penalty totaling $5.00.',
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    // Click view details
    fireEvent.click(screen.getByText('View Details'));

    // Check modal content
    expect(screen.getByText('Penalty Details')).toBeInTheDocument();
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.getByText(/Overdue book: "Test Book"/)).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', async () => {
    const mockPenalties = [
      {
        penalty_id: 1,
        reservation_id: 1,
        amount: 5.00,
        reason: 'Overdue book',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        book_title: 'Test Book',
        book_author: 'Test Author',
        due_date: '2024-01-01T00:00:00Z',
        return_date: null,
      },
    ];

    mockGetUserPenalties.mockResolvedValue({
      penalties: mockPenalties,
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 5.00,
        restriction_reason: 'restriction',
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('View Details'));
    });

    expect(screen.getByText('Penalty Details')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('×'));

    expect(screen.queryByText('Penalty Details')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    mockGetUserPenalties.mockResolvedValue({
      penalties: null,
      error: 'Failed to load penalties',
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: null,
      error: 'Failed to check status',
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load penalties')).toBeInTheDocument();
    });
  });

  it('should display penalty with paid status correctly', async () => {
    const mockPenalties = [
      {
        penalty_id: 1,
        reservation_id: 1,
        amount: 5.00,
        reason: 'Overdue book',
        status: 'paid' as const,
        created_at: '2024-01-01T00:00:00Z',
        book_title: 'Test Book',
        book_author: 'Test Author',
        due_date: '2024-01-01T00:00:00Z',
        return_date: null,
      },
    ];

    mockGetUserPenalties.mockResolvedValue({
      penalties: mockPenalties,
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: true,
        pending_penalty_count: 0,
        pending_penalty_amount: 0,
        restriction_reason: null,
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('✓ No outstanding penalties')).toBeInTheDocument();
    });
  });

  it('should not show details when showDetails is false', async () => {
    const mockPenalties = [
      {
        penalty_id: 1,
        reservation_id: 1,
        amount: 5.00,
        reason: 'Overdue book',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        book_title: 'Test Book',
        book_author: 'Test Author',
        due_date: '2024-01-01T00:00:00Z',
        return_date: null,
      },
    ];

    mockGetUserPenalties.mockResolvedValue({
      penalties: mockPenalties,
      error: null,
    });
    mockCheckUserCanReserve.mockResolvedValue({
      status: {
        can_reserve: false,
        pending_penalty_count: 1,
        pending_penalty_amount: 5.00,
        restriction_reason: 'restriction',
      },
      error: null,
    });

    render(<PenaltyStatus showDetails={false} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('penalty')).toBeInTheDocument();
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });
  });
});