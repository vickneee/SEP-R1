jest.mock("@/utils/supabase/server");

import * as notificationModule from "@/components/sections/NotificationAction";
import * as supabaseModule from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;

let mockSupabase: SupabaseClientType;

const createClientMock = supabaseModule.createClient as jest.MockedFunction<
  typeof supabaseModule.createClient
>;

type MockQueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  gte: jest.Mock;
  lte: jest.Mock;
  update: jest.Mock;
  then: (
    onResolve: (value: { data: unknown; error: unknown }) => unknown
  ) => Promise<unknown>;
};

const createMockQueryBuilder = (resolveValue: {
  data: unknown;
  error: unknown;
}) => {
  const mockBuilder: Partial<MockQueryBuilder> = {
    select: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    update: jest.fn(),
  };

  Object.keys(mockBuilder).forEach((key) => {
    (mockBuilder[key as keyof typeof mockBuilder] as jest.Mock).mockReturnValue(
      mockBuilder
    );
  });

  mockBuilder.then = (onResolve) => Promise.resolve(onResolve(resolveValue));

  return mockBuilder;
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
      data: { user: { id: "user123" } },
      error: null,
    });

    const mockNotifications = [
      { reservation_id: 1, book_id: 101, due_date: "2025-09-20T00:00:00.000Z" },
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

  test("getOverdueNotification returns overdue notifications", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    const mockOverdue = [
      { reservation_id: 2, book_id: 102, due_date: "2025-09-10T00:00:00.000Z" },
    ];

    currentMockQueryBuilder = createMockQueryBuilder({
      data: mockOverdue,
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValue(currentMockQueryBuilder);

    const result = await notificationModule.getOverdueNotification();

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("reservations");
    expect(result).toBeDefined();
    expect(result!.notifications).toEqual(mockOverdue);
    expect(result!.error).toBeNull();
  });

  test("markReminderSentAsTrue updates reminder_sent field", async () => {
    const reservationId = 1;

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
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
