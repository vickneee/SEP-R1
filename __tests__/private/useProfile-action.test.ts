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

type MockQueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  single?: jest.Mock;
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
    single: jest.fn(),
  };

  Object.keys(mockBuilder).forEach((key) => {
    (mockBuilder[key as keyof typeof mockBuilder] as jest.Mock).mockReturnValue(
      mockBuilder
    );
  });

  mockBuilder.then = jest.fn((onResolve) =>
    Promise.resolve(onResolve(resolveValue))
  );

  return mockBuilder;
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
