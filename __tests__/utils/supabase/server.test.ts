process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

describe("createClient (SSR)", () => {
  it("calls createServerClient with correct arguments and cookie handlers", async () => {
    const mockCookieStore = {
      getAll: jest.fn(() => [{ name: "session", value: "abc" }]),
      set: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const mockClient = { auth: {}, from: jest.fn() };
    (createServerClient as jest.Mock).mockReturnValue(mockClient);

    const { createClient } = require("@/utils/supabase/server");
    const client = await createClient();

    expect(cookies).toHaveBeenCalled();
    expect(createServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        },
      }
    );

    // cookie handlers work
    const mockedCreateServerClient = createServerClient as jest.Mock;
    const cookieHandlers = mockedCreateServerClient.mock.calls[0][2].cookies;

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
