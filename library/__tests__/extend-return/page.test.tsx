import {getAllBorrowedBooks} from "@/app/extend-return/extendReturnActions";
import ExtendReturnBookPage from "@/app/extend-return/page";
import React from "react";
import {BorrowedBook} from "@/types/borrowedBook";
import {render} from "@testing-library/react";

// Mock Supabase client for client-side
const createMockClient = (reservations: any[]) => ({
    auth: {
        getUser: jest.fn().mockResolvedValue({
            data: {user: {id: 'librarian-123', email: 'librarian@library.com'}},
        }),
    },

    from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
            data: reservations,
            error: null,
        }),
    }),
});

// Make createClient a Jest mock
const mockCreateClient = jest.fn();
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => mockCreateClient(),
}));

// Mock extendReservation API
jest.mock("@/app/books/extendedAction", () => ({
    extendReservation: jest.fn(),
}));

// Mock getAllBorrowedBooks API
jest.mock("@/app/extend-return/extendReturnActions", () => ({
    getAllBorrowedBooks: jest.fn(),
}));

const mockedGetAllBorrowedBooks = getAllBorrowedBooks as jest.Mock;

// Test user with reservations
describe('Extend Return Books Management Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all borrowed books for librarian', async () => {
        // Mock borrowed books data
        const mockBorrowedBooks: BorrowedBook[] = [
            {
                reservation_id: 1,
                due_date: '2023-09-15',
                status: 'active',
                extended: false,
                user_id: 'user-123',
                user_email: 'customer@helsinki.com',
                user_name: 'Customer One',
                book_title: 'Test Book 1',
                book_author: 'Author A',
            },
            {
                reservation_id: 2,
                due_date: '2023-09-20',
                status: 'active',
                extended: true,
                user_id: 'user-456',
                user_email: 'customer456@gmail.com',
                user_name: 'Customer Two',
                book_title: 'Test Book 2',
                book_author: 'Author B',
            },
        ];

        // Mock getAllBorrowedBooks to return test data
        mockedGetAllBorrowedBooks.mockResolvedValue({ borrowedBooks: mockBorrowedBooks, error: null });

        mockCreateClient.mockReturnValueOnce(
            createMockClient(mockBorrowedBooks)
        );

        // Render the component
        const { findByText } = render(<ExtendReturnBookPage/>);

        expect(await findByText('Test Book 1')).toBeInTheDocument();
        expect(await findByText('Test Book 2')).toBeInTheDocument();
    });
});
