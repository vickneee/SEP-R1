import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("getAdminClient", () => {
  const mockUrl = "https://example.supabase.co";
  const mockKey = "super-secret-key";

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = mockKey;
  });

  it("calls createClient with correct arguments", () => {
    const { getAdminClient } = require("@/utils/supabase/admin");
    getAdminClient();
    expect(createClient).toHaveBeenCalledWith(mockUrl, mockKey);
  });

  it("returns the client instance", () => {
    const mockClient = { from: jest.fn() };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    const { getAdminClient } = require("@/utils/supabase/admin");
    const client = getAdminClient();
    expect(client).toBe(mockClient);
  });
});
