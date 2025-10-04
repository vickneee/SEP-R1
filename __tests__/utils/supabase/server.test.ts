import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

describe("createClient (SSR)", () => {
  let createClient: () => Promise<SupabaseClient<Database>>;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key";

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    createClient = require("@/utils/supabase/server").createClient;
  });

  it("calls createServerClient with correct arguments and cookie handlers", async () => {
    const mockCookieStore = {
      getAll: jest.fn(() => [{ name: "session", value: "abc" }]),
      set: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const mockClient = { auth: {}, from: jest.fn() };
    (createServerClient as jest.Mock).mockReturnValue(mockClient);

    const client = await createClient();

    expect(cookies).toHaveBeenCalled();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-public-key",
      {
        cookies: {
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        },
      }
    );

    const cookieHandlers = (createServerClient as jest.Mock).mock.calls[0][2]
      .cookies;

    expect(cookieHandlers.getAll()).toEqual([
      { name: "session", value: "abc" },
    ]);

    cookieHandlers.setAll([
      { name: "session", value: "xyz", options: { path: "/" } },
    ]);
    expect(mockCookieStore.set).toHaveBeenCalledWith("session", "xyz", {
      path: "/",
    });

    expect(client).toBe(mockClient);
  });
});
