import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import ExtendReturnBookPage from "@/app/extend-return/page";
import { getAllBorrowedBooks } from "@/app/extend-return/extendReturnActions";
import { extendReservation } from "@/app/books/extendedAction";
import { createClient } from "@/utils/supabase/client";
import userEvent from "@testing-library/user-event";

// --- Mocks ---
const mockRpc = jest.fn();

// Mock Supabase client wrapper
const mockSupabase = {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
    rpc: mockRpc,
};

jest.mock("@/utils/supabase/client", () => ({
    createClient: jest.fn(() => mockSupabase),
}));

jest.mock("@/app/books/extendedAction", () => ({
    extendReservation: jest.fn(),
}));

jest.mock("@/app/extend-return/extendReturnActions", () => ({
    getAllBorrowedBooks: jest.fn(),
}));

const mockedGetAllBorrowedBooks = getAllBorrowedBooks as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
});

// Test user with reservations
describe('Extend Return Books Management Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    it('renders message when no borrowed books', async () => {
        // Mock getAllBorrowedBooks to return empty data
        mockedGetAllBorrowedBooks.mockResolvedValue({ borrowedBooks: [], error: null });

       render(<ExtendReturnBookPage/>);

        expect(await screen.findByText('No borrowed books found.')).toBeInTheDocument();
    });

    it('shows loading state initially', async () => {
        // Mock getAllBorrowedBooks to return empty data after a delay
        mockedGetAllBorrowedBooks.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve({ borrowedBooks: [], error: null }), 100);
        }));
        const { getByText } = render(<ExtendReturnBookPage/>);

        expect(getByText('Loading borrowed books...')).toBeInTheDocument();

        // Wait for the async function to complete
        await waitFor(() => {
            expect(mockedGetAllBorrowedBooks).toHaveBeenCalled();
        });
    });

    it("calls extendReservation when Extend button clicked", async () => {
        const mockBorrowedBooks = [
            {
                reservation_id: 1,
                due_date: "2023-09-15",
                status: "active",
                extended: false,
                user_id: "user-123",
                user_email: "test@test.com",
                user_name: "Test User",
                book_title: "Test Book",
                book_author: "Author",
            },
        ];

        mockedGetAllBorrowedBooks.mockResolvedValue({ borrowedBooks: mockBorrowedBooks, error: null });

        render(<ExtendReturnBookPage />);

        const extendButton = await screen.findByRole('button', { name: /Extend/i });
        await userEvent.click(extendButton);

        await waitFor(() => {
            expect(extendReservation).toHaveBeenCalledWith(1);
        });
    });
});
