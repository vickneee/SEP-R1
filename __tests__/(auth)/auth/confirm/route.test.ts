import { GET } from "@/app/(auth)/auth/confirm/route";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

jest.mock("@/utils/supabase/server", () => ({
    createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

describe("GET /auth/confirm", () => {
    const mockRedirect = redirect as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects to /error if token_hash or type is missing", async () => {
        const request = new NextRequest("http://localhost/auth/confirm");
        await GET(request);
        expect(mockRedirect).toHaveBeenCalledWith("/error");
    });
});
