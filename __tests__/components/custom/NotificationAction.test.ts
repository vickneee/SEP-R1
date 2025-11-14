jest.mock("@/utils/supabase/server");

import * as notificationModule from "@/components/custom/NotificationAction";
import * as supabaseModule from "@/utils/supabase/server";
import {createClient} from "@/utils/supabase/server";

// --- Mock next/navigation ---
jest.mock("next/navigation", () => ({
    useParams: jest.fn(() => ({locale: "en"})),
    useRouter: jest.fn(() => ({push: jest.fn()})),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
}));

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;

let mockSupabase: SupabaseClientType;

const createClientMock = supabaseModule.createClient as jest.MockedFunction<
    typeof supabaseModule.createClient
>;

class QueryBuilderPromise extends Promise<{ data: unknown; error: unknown }> {
    select!: jest.Mock;
    eq!: jest.Mock;
    gte!: jest.Mock;
    lte!: jest.Mock;
    update!: jest.Mock;
}

const createMockQueryBuilder = (resolveValue: { data: unknown; error: unknown }) => {
    const qb = new QueryBuilderPromise((resolve) => resolve(resolveValue));

    // Methods allowed in chain
    const methods = ["select", "eq", "gte", "lte", "update"] as const;
    type Method = (typeof methods)[number];

    // Attach mock methods (NOT override `.then`)
    for (const m of methods) {
        const fn = jest.fn(() => qb);
        (qb as Record<Method, jest.Mock>)[m] = fn;
    }

    return qb;
};

let currentMockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

describe("Notification module", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn(),
        } as unknown as SupabaseClientType;

        createClientMock.mockResolvedValue(mockSupabase);
    });

    test("getDueDateNotification returns notifications", async () => {
        (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {user: {id: "user123"}},
            error: null,
        });

        const mockNotifications = [
            {reservation_id: 1, book_id: 101, due_date: "2025-09-20T00:00:00.000Z"},
        ];

        currentMockQueryBuilder = createMockQueryBuilder({
            data: mockNotifications,
            error: null,
        });
        (mockSupabase.from as jest.Mock).mockReturnValue(currentMockQueryBuilder);

        const result = await notificationModule.getDueDateNotification();

        expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        expect(mockSupabase.from).toHaveBeenCalledWith("reservations");
        expect(result).toBeDefined();
        expect(result!.notifications).toEqual(mockNotifications);
        expect(result!.error).toBeNull();
    });

    test("markReminderSentAsTrue updates reminder_sent field", async () => {
        const reservationId = 1;

        (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {user: {id: "user123"}},
            error: null,
        });

        currentMockQueryBuilder = createMockQueryBuilder({
            data: null,
            error: null,
        });
        (mockSupabase.from as jest.Mock).mockReturnValue(currentMockQueryBuilder);

        const result = await notificationModule.markReminderSentAsTrue(
            reservationId
        );

        expect(mockSupabase.from).toHaveBeenCalledWith("reservations");
        expect(currentMockQueryBuilder.update).toHaveBeenCalledWith({
            reminder_sent: true,
        });
        expect(currentMockQueryBuilder.eq).toHaveBeenCalledWith(
            "reservation_id",
            reservationId
        );
        expect(result).toBeDefined();
        expect(result!.error).toBeNull();
    });
});
