jest.mock("@/utils/supabase/server");
jest.mock("@/utils/supabase/admin", () => ({
  getAdminClient: jest.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import * as supabaseModule from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import * as adminModule from "@/utils/supabase/admin";
import { updateUserAction } from "@/app/[locale]/(dashboard)/customer-dashboard/update-user-action";

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;
type SupabaseAdminType = ReturnType<typeof getAdminClient>;

let mockSupabase: SupabaseClientType;
let mockAdminClient: SupabaseAdminType;

const createClientMock = supabaseModule.createClient as jest.MockedFunction<
  typeof createClient
>;
const getAdminClientMock = adminModule.getAdminClient as jest.MockedFunction<
  typeof getAdminClient
>;

describe("updateUserAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    } as unknown as SupabaseClientType;

    mockAdminClient = {
      auth: {
        admin: {
          updateUserById: jest.fn(),
        },
      },
    } as unknown as SupabaseAdminType;

    createClientMock.mockResolvedValue(mockSupabase);
    getAdminClientMock.mockReturnValue(mockAdminClient);
  });

  it("should uer email address and return message", async () => {
    const formData = new FormData();
    formData.append("email", "newemail@example.com");

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    (mockAdminClient.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: "user123",
          email: "newemail@example.com",
        },
      },
      zodErrors: null,
      message: "Email update successful!",
    });

    const result = await updateUserAction(
      { message: null, zodErrors: null, data: null },
      formData
    );

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockAdminClient.auth.admin.updateUserById).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result!.message).toMatch("Email update successful!");
  });

  it("should fail if user data is missing", async () => {
    const formData = new FormData();
    formData.append("email", "newemail@example.com");

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Session expired" },
    });

    const result = await updateUserAction(
      { message: null, zodErrors: null, data: null },
      formData
    );

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result!.message).toMatch("There is no user data: Session expired");
  });
});
