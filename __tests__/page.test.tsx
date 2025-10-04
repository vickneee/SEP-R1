import {render, screen, waitFor} from "@testing-library/react";
import Home from "@/app/page";

// Mock data
const mockBooks = [
    { id: 1, title: "Book 1", author: "Author 1" },
    { id: 2, title: "Book 2", author: "Author 2" },
];

// Mock Supabase client
const mockFrom = jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
}));
const mockSupabase = { from: mockFrom };


jest.mock("@/utils/supabase/client", () => ({
    createClient: jest.fn(() => mockSupabase),
}));

describe("Home", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches and displays books", async () => {
        render(<Home />);
        // Wait for the books to be fetched and rendered
        await waitFor(() => {
            // Check for book titles in the document
            expect(screen.getByText("Book 1")).toBeInTheDocument();
            expect(screen.getByText("Book 2")).toBeInTheDocument();
        });
    });
})

