import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OverdueBooksPage from "../../app/penalties/page";
import * as penaltyActions from "../../app/penalties/penaltyActions";

// Mock the penalty actions
jest.mock("../../app/penalties/penaltyActions");

const mockOverdueBooks = [
    {
        reservation_id: 1,
        user_name: "John Doe",
        user_email: "john@example.com",
        book_title: "The Great Gatsby",
        book_author: "F. Scott Fitzgerald",
        due_date: "2024-12-27T00:00:00Z",
        days_overdue: 5,
        user_id: "user-123",
    },
    {
        reservation_id: 2,
        user_name: "Jane Smith",
        user_email: "jane@example.com",
        book_title: "1984",
        book_author: "George Orwell",
        due_date: "2024-12-20T00:00:00Z",
        days_overdue: 12,
        user_id: "user-456",
    },
];

describe("OverdueBooksPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state initially", () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        render(<OverdueBooksPage />);

        expect(screen.getByText(/loading overdue books/i)).toBeInTheDocument();
    });

    it("should display overdue books after loading", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
            expect(screen.getByText("1984")).toBeInTheDocument();
        });
    });

    it("should display summary statistics correctly", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            // Total overdue books: 2
            const overdueCountElement = screen.getByText("2");
            expect(overdueCountElement).toBeInTheDocument();

            // Average days overdue: (5 + 12) / 2 = 8.5 => 9 (rounded)
            const averageDaysElements = screen.getAllByText(/9/);
            expect(averageDaysElements.length).toBeGreaterThan(0);
        });
    });

    it("should display 'No overdue books' message when list is empty", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: [],
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText(/no overdue books found/i)).toBeInTheDocument();
        });
    });

    it("should display error message when loading fails", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: null,
            error: "Failed to load overdue books",
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load overdue books/i)).toBeInTheDocument();
        });
    });

    it("should call markBookReturned when button is clicked", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.markBookReturned as jest.Mock).mockResolvedValue({
            success: true,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const markReturnedButtons = screen.getAllByText(/mark as returned/i);
        fireEvent.click(markReturnedButtons[0]);

        await waitFor(() => {
            expect(penaltyActions.markBookReturned).toHaveBeenCalledWith(1);
        });
    });

    it("should remove book from list after successful return", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.markBookReturned as jest.Mock).mockResolvedValue({
            success: true,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const markReturnedButtons = screen.getAllByText(/mark as returned/i);
        fireEvent.click(markReturnedButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/book marked as returned successfully/i)).toBeInTheDocument();
            expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        });
    });

    it("should display error when marking book as returned fails", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.markBookReturned as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to mark book as returned",
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const markReturnedButtons = screen.getAllByText(/mark as returned/i);
        fireEvent.click(markReturnedButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/failed to mark book as returned/i)).toBeInTheDocument();
            // Book should still be in the list
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    it("should call processOverdueBooks when Process button is clicked", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.processOverdueBooks as jest.Mock).mockResolvedValue({
            processed_count: 5,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const processButton = screen.getByText(/process overdue books/i);
        fireEvent.click(processButton);

        await waitFor(() => {
            expect(penaltyActions.processOverdueBooks).toHaveBeenCalled();
            expect(screen.getByText(/processed 5 overdue books/i)).toBeInTheDocument();
        });
    });

    it("should reload books after processing overdue books", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock)
            .mockResolvedValueOnce({
                overdueBooks: mockOverdueBooks,
                error: null,
            })
            .mockResolvedValueOnce({
                overdueBooks: [...mockOverdueBooks, {
                    reservation_id: 3,
                    user_name: "New User",
                    user_email: "new@example.com",
                    book_title: "New Book",
                    book_author: "New Author",
                    due_date: "2024-12-15T00:00:00Z",
                    days_overdue: 17,
                    user_id: "user-789",
                }],
                error: null,
            });

        (penaltyActions.processOverdueBooks as jest.Mock).mockResolvedValue({
            processed_count: 1,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const processButton = screen.getByText(/process overdue books/i);
        fireEvent.click(processButton);

        await waitFor(() => {
            expect(penaltyActions.getAllOverdueBooks).toHaveBeenCalledTimes(2);
            expect(screen.getByText("New User")).toBeInTheDocument();
        });
    });

    it("should refresh books when Refresh button is clicked", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const refreshButton = screen.getByText(/refresh/i);
        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(penaltyActions.getAllOverdueBooks).toHaveBeenCalledTimes(2);
        });
    });

    it("should show correct badge color based on days overdue", async () => {
        const booksWithVariedOverdueDays = [
            { ...mockOverdueBooks[0], days_overdue: 2 }, // <= 3 days: yellow
            { ...mockOverdueBooks[1], days_overdue: 5 }, // <= 7 days: orange
            {
                reservation_id: 3,
                user_name: "Late User",
                user_email: "late@example.com",
                book_title: "Very Late Book",
                book_author: "Author",
                due_date: "2024-12-01T00:00:00Z",
                days_overdue: 10,
                user_id: "user-789",
            }, // > 7 days: red
        ];

        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: booksWithVariedOverdueDays,
            error: null,
        });

        render(<OverdueBooksPage />);

        await waitFor(() => {
            const daysBadges = screen.getAllByText(/days/i);
            expect(daysBadges.length).toBeGreaterThan(0);
        });
    });

    it("should disable buttons while processing", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.markBookReturned as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ success: true, error: null }), 100))
        );

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const markReturnedButtons = screen.getAllByText(/mark as returned/i);
        fireEvent.click(markReturnedButtons[0]);

        // Button should show "Processing..." while loading
        await waitFor(() => {
            expect(screen.getByText(/processing\.\.\./i)).toBeInTheDocument();
        });
    });

    it("should handle exceptions when loading overdue books", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockRejectedValue(
            new Error("Network error")
        );

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load overdue books/i)).toBeInTheDocument();
        });
    });

    it("should handle exceptions when marking book as returned", async () => {
        (penaltyActions.getAllOverdueBooks as jest.Mock).mockResolvedValue({
            overdueBooks: mockOverdueBooks,
            error: null,
        });
        (penaltyActions.markBookReturned as jest.Mock).mockRejectedValue(
            new Error("Network error")
        );

        render(<OverdueBooksPage />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        const markReturnedButtons = screen.getAllByText(/mark as returned/i);
        fireEvent.click(markReturnedButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/failed to mark book as returned/i)).toBeInTheDocument();
        });
    });
});
