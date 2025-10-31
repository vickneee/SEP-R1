jest.mock("@/utils/supabase/server");
jest.mock("@/utils/supabase/admin", () => ({
  getAdminClient: jest.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import * as supabaseModule from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import * as adminModule from "@/utils/supabase/admin";
import { POST } from "@/app/[locale]/api/delete-user/route";

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

describe("POST /api/delete-user", () => {
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
          deleteUser: jest.fn(),
        },
      },
    } as unknown as SupabaseAdminType;

    createClientMock.mockResolvedValue(mockSupabase);
    getAdminClientMock.mockReturnValue(mockAdminClient);
  });

  it("should delete user and return success", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    (mockAdminClient.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
      error: null,
    });

    const response = await POST();
    const json = await response.json();

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(
      "user123"
    );
    expect(json).toEqual({ success: true });
  });

  it("should return error if deleteUser fails", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    (mockAdminClient.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
      error: { message: "Delete failed" },
    });

    const response = await POST();
    const json = await response.json();

    expect(json).toEqual({ success: false, error: "Delete failed" });
  });

  it("should return error if getUser fails", async () => {
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Auth error" },
    });

    const response = await POST();
    const json = await response.json();

    expect(json).toEqual({ success: false, error: "Auth error" });
  });
});
