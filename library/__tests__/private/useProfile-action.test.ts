jest.mock("@/utils/supabase/server");

import * as userProfileModule from "@/app/private/userProfile-action";
import * as supabaseModule from "@/utils/supabase/server";

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

const createClientMock = supabaseModule.createClient as jest.MockedFunction<
  typeof supabaseModule.createClient
>;
createClientMock.mockReturnValue(mockSupabase as any);

const createMockQueryBuilder = (resolveValue: {
  data: unknown;
  error: unknown;
}) => {
  const mockBuilder = {
    select: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    update: jest.fn(),
    single: jest.fn(),
  };

  Object.keys(mockBuilder).forEach((key) => {
    mockBuilder[key as keyof typeof mockBuilder].mockReturnValue(mockBuilder);
  });

  (mockBuilder as any).then = jest.fn((onResolve) =>
    Promise.resolve(onResolve(resolveValue))
  );

  return mockBuilder;
};

let currentMockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

describe("User profile module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentMockQueryBuilder = createMockQueryBuilder({ data: [], error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);
  });

  test("getUserProfile returns user profile", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
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
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const result = await userProfileModule.getUserProfile();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("users");
    expect(result).toBeDefined();
    expect(result).toEqual(mockUserProfile);
  });
});
