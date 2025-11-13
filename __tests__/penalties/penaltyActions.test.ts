import * as penaltyModule from "../../app/[locale]/penalties/penaltyActions";
import * as supabaseModule from "../../utils/supabase/server";

jest.mock("../../utils/supabase/server");

// Mock data
const mockUserId = "user-123";
const mockLibrarianId = "librarian-456";

const mockUserPenalties = [
    {
        penalty_id: 1,
        reservation_id: 1,
        amount: 0,
        reason: "Overdue book: \"Test Book\" (5 days overdue)",
        status: "pending" as const,
        created_at: "2025-01-01",
        book_title: "Test Book",
        book_author: "Test Author",
        due_date: "2024-12-27",
        return_date: null,
    },
];

const mockOverdueBooks = [
    {
        reservation_id: 1,
        user_name: "John Doe",
        user_email: "john@example.com",
        book_title: "Test Book",
        book_author: "Test Author",
        due_date: "2024-12-27T00:00:00Z",
        days_overdue: 5,
        user_id: mockUserId,
    },
];

// Create mock query builder
const createMockQueryBuilder = (resolveValue: { data: unknown; error: unknown } = { data: null, error: null }) => {
    const mockBuilder = {
        select: jest.fn(),
        eq: jest.fn(),
        single: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    // Make all methods chainable
    Object.keys(mockBuilder).forEach(key => {
        if (key !== 'single') {
            mockBuilder[key as keyof typeof mockBuilder].mockReturnValue(mockBuilder);
        }
    });

    // single() should return the actual data
    mockBuilder.single.mockResolvedValue(resolveValue);

    // // Make the builder itself thenable for direct awaiting
    // (mockBuilder as unknown as { then: jest.Mock }).then = jest.fn((onResolve) => {
    //     return Promise.resolve(onResolve(resolveValue));
    // });

    return mockBuilder;
};

// Main mock Supabase client
const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
        getUser: jest.fn(),
    },
};

const createClientMock = supabaseModule.createClient as jest.MockedFunction<
    typeof supabaseModule.createClient
>;

describe("Penalty Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        createClientMock.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof supabaseModule.createClient>>);
    });

    describe("getUserPenalties", () => {
        it("should return penalties for authenticated user", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: mockUserPenalties,
                error: null,
            });

            const result = await penaltyModule.getUserPenalties();

            expect(mockSupabase.auth.getUser).toHaveBeenCalled();
            expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_penalties", {
                user_uuid: mockUserId,
            });
            expect(result.penalties).toEqual(mockUserPenalties);
            expect(result.error).toBeNull();
        });

        it("should return penalties for specific user ID", async () => {
            mockSupabase.rpc.mockResolvedValue({
                data: mockUserPenalties,
                error: null,
            });

            const result = await penaltyModule.getUserPenalties(mockUserId);

            expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
            expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_penalties", {
                user_uuid: mockUserId,
            });
            expect(result.penalties).toEqual(mockUserPenalties);
            expect(result.error).toBeNull();
        });

        it("should handle error when user is not authenticated", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const result = await penaltyModule.getUserPenalties();

            expect(result.penalties).toBeNull();
            expect(result.error).toBe("User not authenticated");
        });

        it("should handle RPC error", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: null,
                error: { message: "Database error" },
            });

            const result = await penaltyModule.getUserPenalties();

            expect(result.penalties).toBeNull();
            expect(result.error).toBe("Database error");
        });
    });

    describe("checkUserCanReserve", () => {
        it("should return can_reserve as false when user has overdue books", async () => {
            const restrictedStatus = {
                can_reserve: false,
                overdue_book_count: 2,
                restriction_reason: "You have 2 overdue books. Please return them to continue borrowing.",
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: [restrictedStatus],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve();

            expect(mockSupabase.rpc).toHaveBeenCalledWith("can_user_reserve_books", {
                user_uuid: mockUserId,
            });
            expect(result.status).toEqual(restrictedStatus);
            expect(result.status?.can_reserve).toBe(false);
            expect(result.status?.overdue_book_count).toBe(2);
            expect(result.error).toBeNull();
        });

        it("should return can_reserve as true when user has no overdue books", async () => {
            const allowedStatus = {
                can_reserve: true,
                overdue_book_count: 0,
                restriction_reason: null,
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: [allowedStatus],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve();

            expect(result.status?.can_reserve).toBe(true);
            expect(result.status?.overdue_book_count).toBe(0);
            expect(result.error).toBeNull();
        });

        it("should check specific user by ID", async () => {
            const status = {
                can_reserve: true,
                overdue_book_count: 0,
                restriction_reason: null,
            };

            mockSupabase.rpc.mockResolvedValue({
                data: [status],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve(mockUserId);

            expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
            expect(mockSupabase.rpc).toHaveBeenCalledWith("can_user_reserve_books", {
                user_uuid: mockUserId,
            });
            expect(result.status).toEqual(status);
            expect(result.error).toBeNull();
        });

        it("should handle authentication error", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const result = await penaltyModule.checkUserCanReserve();

            expect(result.status).toBeNull();
            expect(result.error).toBe("User not authenticated");
        });

        it("should handle RPC error", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: null,
                error: { message: "Database error" },
            });

            const result = await penaltyModule.checkUserCanReserve();

            expect(result.status).toBeNull();
            expect(result.error).toBe("Database error");
        });

        it("should handle no data returned from RPC", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: [],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve();

            expect(result.status).toBeNull();
            expect(result.error).toBe("No data returned");
        });
    });

    describe("markBookReturned", () => {
        it("should successfully mark book as returned by librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: true,
                error: null,
            });

            const result = await penaltyModule.markBookReturned(1);

            expect(mockSupabase.from).toHaveBeenCalledWith("users");
            expect(mockSupabase.rpc).toHaveBeenCalledWith("mark_book_returned", {
                reservation_uuid: 1,
            });
            expect(result.success).toBe(true);
            expect(result.error).toBeNull();
        });

        it("should reject if user is not authenticated", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const result = await penaltyModule.markBookReturned(1);

            expect(result.success).toBe(false);
            expect(result.error).toBe("User not authenticated");
        });

        it("should reject if user is not a librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "customer" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);

            const result = await penaltyModule.markBookReturned(1);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Only librarians can mark books as returned");
        });

        it("should handle RPC error", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: null,
                error: { message: "RPC failed" },
            });

            const result = await penaltyModule.markBookReturned(1);

            expect(result.success).toBe(false);
            expect(result.error).toBe("RPC failed");
        });
    });

    describe("getAllOverdueBooks", () => {
        it("should return all overdue books for librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: mockOverdueBooks,
                error: null,
            });

            const result = await penaltyModule.getAllOverdueBooks();

            expect(mockSupabase.rpc).toHaveBeenCalledWith("get_all_overdue_books");
            expect(result.overdueBooks).toEqual(mockOverdueBooks);
            expect(result.error).toBeNull();
        });

        it("should reject if user is not authenticated", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const result = await penaltyModule.getAllOverdueBooks();

            expect(result.overdueBooks).toBeNull();
            expect(result.error).toBe("User not authenticated");
        });

        it("should reject if user is not a librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "customer" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);

            const result = await penaltyModule.getAllOverdueBooks();

            expect(result.overdueBooks).toBeNull();
            expect(result.error).toBe("Only librarians can view overdue books");
        });

        it("should return empty array when no overdue books", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: [],
                error: null,
            });

            const result = await penaltyModule.getAllOverdueBooks();

            expect(result.overdueBooks).toEqual([]);
            expect(result.error).toBeNull();
        });
    });

    describe("processOverdueBooks", () => {
        it("should successfully process overdue books for librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: 5,
                error: null,
            });

            const result = await penaltyModule.processOverdueBooks();

            expect(mockSupabase.rpc).toHaveBeenCalledWith("process_overdue_books");
            expect(result.processed_count).toBe(5);
            expect(result.error).toBeNull();
        });

        it("should reject if user is not authenticated", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const result = await penaltyModule.processOverdueBooks();

            expect(result.processed_count).toBe(0);
            expect(result.error).toBe("User not authenticated");
        });

        it("should reject if user is not a librarian", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "customer" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);

            const result = await penaltyModule.processOverdueBooks();

            expect(result.processed_count).toBe(0);
            expect(result.error).toBe("Only librarians can process overdue books");
        });

        it("should handle RPC error", async () => {
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockLibrarianId } },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValue({
                data: null,
                error: { message: "Processing failed" },
            });

            const result = await penaltyModule.processOverdueBooks();

            expect(result.processed_count).toBe(0);
            expect(result.error).toBe("Processing failed");
        });
    });

    describe("Restriction scenarios", () => {
        it("should restrict user from reserving books when they have overdue items", async () => {
            const restrictedStatus = {
                can_reserve: false,
                overdue_book_count: 1,
                restriction_reason: "You have 1 overdue book. Please return it to continue borrowing.",
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: [restrictedStatus],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve(mockUserId);

            expect(result.status?.can_reserve).toBe(false);
            expect(result.status?.overdue_book_count).toBeGreaterThan(0);
            expect(result.status?.restriction_reason).toContain("overdue");
        });

        it("should lift restriction after book is returned", async () => {
            // First, user is restricted
            const restrictedStatus = {
                can_reserve: false,
                overdue_book_count: 1,
                restriction_reason: "You have 1 overdue book. Please return it to continue borrowing.",
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValueOnce({
                data: [restrictedStatus],
                error: null,
            });

            const restrictedResult = await penaltyModule.checkUserCanReserve(mockUserId);
            expect(restrictedResult.status?.can_reserve).toBe(false);

            // Librarian marks book as returned
            const mockQueryBuilder = createMockQueryBuilder({
                data: { role: "librarian" },
                error: null,
            });
            mockSupabase.from.mockReturnValue(mockQueryBuilder);
            mockSupabase.rpc.mockResolvedValueOnce({
                data: true,
                error: null,
            });

            const returnResult = await penaltyModule.markBookReturned(1);
            expect(returnResult.success).toBe(true);

            // After return, user can reserve again
            const allowedStatus = {
                can_reserve: true,
                overdue_book_count: 0,
                restriction_reason: null,
            };

            mockSupabase.rpc.mockResolvedValueOnce({
                data: [allowedStatus],
                error: null,
            });

            const allowedResult = await penaltyModule.checkUserCanReserve(mockUserId);
            expect(allowedResult.status?.can_reserve).toBe(true);
            expect(allowedResult.status?.overdue_book_count).toBe(0);
        });

        it("should handle multiple overdue books correctly", async () => {
            const restrictedStatus = {
                can_reserve: false,
                overdue_book_count: 3,
                restriction_reason: "You have 3 overdue books. Please return them to continue borrowing.",
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });
            mockSupabase.rpc.mockResolvedValue({
                data: [restrictedStatus],
                error: null,
            });

            const result = await penaltyModule.checkUserCanReserve(mockUserId);

            expect(result.status?.can_reserve).toBe(false);
            expect(result.status?.overdue_book_count).toBe(3);
            expect(result.status?.restriction_reason).toContain("3 overdue books");
        });
    });
});
