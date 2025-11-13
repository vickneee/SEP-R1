jest.mock("@/utils/supabase/server");

import * as userProfileModule from "@/app/[locale]/private/userProfile-action";
import * as supabaseModule from "@/utils/supabase/server";

import { createClient } from "@/utils/supabase/server";

// --- Mock next/navigation ---
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ locale: "en" })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;

let mockSupabase: SupabaseClientType;
const createClientMock = supabaseModule.createClient as jest.MockedFunction<
  typeof supabaseModule.createClient
>;

type QueryResult<T = unknown> = {
    data: T;
    error: unknown;
};

type MockQueryBuilder<T = unknown> = {
    select: jest.Mock<MockQueryBuilder<T>, [string]>;
    eq: jest.Mock<MockQueryBuilder<T>, [string, unknown]>;
    single: jest.Mock<Promise<QueryResult<T>>, []>;
    promise: jest.Mock<Promise<QueryResult<T>>, []>;
};

const createMockQueryBuilder = <T = unknown>(
    resolveValue: QueryResult<T>
): MockQueryBuilder<T> => {
    const builder: Partial<MockQueryBuilder<T>> = {
        select: jest.fn(),
        eq: jest.fn(),
        single: jest.fn().mockResolvedValue(resolveValue),
        promise: jest.fn().mockResolvedValue(resolveValue),
    };

    // Make chainable methods return builder
    ['select', 'eq'].forEach((key) => {
        (builder[key as keyof typeof builder] as jest.Mock).mockReturnValue(builder);
    });

    return builder as MockQueryBuilder<T>;
};

let currentMockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

describe("User profile module", () => {
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

  test("getUserProfile returns user profile", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    const mockUserProfile = {
      created_at: "2025-09-19T12:00:00Z",
      email: "mockuser@example.com",
      first_name: "Mock",
      last_name: "User",
      is_active: true,
      penalty_count: 0,
      role: "customer",
      user_id: "mock-user-id",
    };

    currentMockQueryBuilder = createMockQueryBuilder({
      data: mockUserProfile,
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValue(currentMockQueryBuilder);

    const result = await userProfileModule.getUserProfile();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("users");
    expect(result).toBeDefined();
    expect(result).toEqual(mockUserProfile);
  });
});
