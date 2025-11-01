import {getAllBorrowedBooks} from "@/app/[locale]/extend-return/extendReturnActions";
import {createClient} from "@/utils/supabase/server";

jest.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'en' }),
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

jest.mock("@/utils/supabase/server", () => ({
    createClient: jest.fn(),
}));

// Mock supabase client shape
const mockSupabase = {
    auth: {
        getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
};

describe("getAllBorrowedBooks", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it("returns error if user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({data: {user: null}, error: null});

        const result = await getAllBorrowedBooks();

        expect(result).toEqual({
            borrowedBooks: null,
            error: "borrowed_error_not_authenticated",
        });
    });

    it("shows error when user is not librarian", async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
            data: { user: { id: "user-123" } },
            error: null,
        });

        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
                eq: jest.fn().mockReturnValueOnce({
                    single: jest.fn().mockResolvedValueOnce({
                        data: { role: "customer" },
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getAllBorrowedBooks();

        expect(result).toEqual({
            borrowedBooks: null,
            error: "borrowed_error_not_librarian",
        });
    });

    it("returns borrowed books for librarian", async () => {
        const mockBorrowedBooks = [
            { reservation_id: 1, due_date: "2023-09-15", status: "active" },
            { reservation_id: 2, due_date: "2023-09-20", status: "active" },
        ];

        mockSupabase.auth.getUser.mockResolvedValueOnce({
            data: { user: { id: "librarian-123" } },
            error: null,
        });

        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
                eq: jest.fn().mockReturnValueOnce({
                    single: jest.fn().mockResolvedValueOnce({
                        data: { role: "librarian" },
                        error: null,
                    }),
                }),
            }),
        });

        mockSupabase.rpc.mockResolvedValueOnce({
            data: mockBorrowedBooks,
            error: null,
        });

        const result = await getAllBorrowedBooks();

        expect(result).toEqual({
            borrowedBooks: mockBorrowedBooks,
            error: null,
        });
    });
});
