import { createClient } from "@/utils/supabase/server";
import * as LibrarianDashboardModule from "@/app/[locale]/(dashboard)/librarian-dashboard/page";
const LibrarianDashboard = LibrarianDashboardModule.default;

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("LibrarianDashboard server component", () => {
  const mockCreateClient = createClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders LibrarianDashboardClient for a valid librarian", async () => {
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({
            data: { user: { id: "123", email: "test@example.com" } },
            error: null,
          }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            user_id: "123",
            role: "librarian",
            first_name: "Test",
            last_name: "Librarian",
          },
          error: null,
        }),
      }),
    });

    const result = await LibrarianDashboard();

    expect(result.type.name).toBe("LibrarianDashboardClient");
    expect(result.props.userEmail).toBe("test@example.com");
    expect(result.props.userProfile.role).toBe("librarian");
  });
});
