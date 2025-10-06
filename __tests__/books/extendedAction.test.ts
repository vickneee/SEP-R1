import { extendReservation } from "@/app/books/extendedAction";
import type { ReservationWithBook } from "@/app/books/extendedAction";

import { createClient } from "@/utils/supabase/server";

jest.mock("@/utils/supabase/server");

type MockSupabaseClient = {
    from: (table: string) => {
        select: (columns: string) => {
            eq: (field: string, value: unknown) => {
                single: () => Promise<{ data: ReservationWithBook | null; error: unknown }>;
            };
        };
        update: (data: Partial<ReservationWithBook>) => {
            eq: (field: string, value: unknown) => {
                select: (columns: string) => {
                    single: () => Promise<{ data: ReservationWithBook | null; error: unknown }>;
                };
            };
        };
    };
};

describe("extendReservation", () => {
    const mockReservation: ReservationWithBook = {
        reservation_id: 1,
        user_id: "user123",
        book_id: 101,
        due_date: new Date().toISOString(),
        status: "active",
        extended: false,
        books: { title: "Book 1", author: "Author 1" },
    };

    const mockUpdatedReservation: ReservationWithBook = {
        ...mockReservation,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        extended: true,
    };

    const mockSingle = jest.fn();

    const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: mockSingle,
            }),
        }),
        update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: mockSingle,
                }),
            }),
        }),
    });

    beforeEach(() => {
        (createClient as jest.Mock).mockResolvedValue({ from: mockFrom } as MockSupabaseClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockSingle.mockReset();
    });

    it("extends a reservation by 7 days and marks it as extended", async () => {
        // First call returns current reservation, second call returns updated
        mockSingle.mockResolvedValueOnce({ data: mockReservation, error: null });
        mockSingle.mockResolvedValueOnce({ data: mockUpdatedReservation, error: null });

        const result = await extendReservation(mockReservation.reservation_id);

        expect(result.extended).toBe(true);
        expect(new Date(result.due_date).getTime()).toBeGreaterThan(new Date(mockReservation.due_date).getTime());
        expect(result.books.title).toBe("Book 1");
        expect(mockFrom).toHaveBeenCalledWith("reservations");
    });
});
