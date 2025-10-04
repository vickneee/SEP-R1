import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: "next", cookies: { set: jest.fn() } })),
    redirect: jest.fn((url) => ({ type: "redirect", url })),
  },
}));

describe("updateSession", () => {
  const mockRequest = {
    headers: {
      get: () => null,
    },
    cookies: {
      getAll: jest.fn(() => []),
      set: jest.fn(),
    },
    nextUrl: {
      pathname: "/private",
      clone: jest.fn(function () {
        return { ...this };
      }),
    },
  } as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /signin if user is not authenticated on protected route", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

    const response = await updateSession(mockRequest as NextRequest);

    expect(createServerClient).toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/signin" })
    );
    expect(response.type).toBe("redirect");
  });

  it("returns NextResponse.next if user is authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

    const response = await updateSession(mockRequest as NextRequest);

    expect(createServerClient).toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.type).toBe("next");
  });
});
