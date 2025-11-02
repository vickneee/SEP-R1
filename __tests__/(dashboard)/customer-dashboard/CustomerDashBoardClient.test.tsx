import { render, screen, act, waitFor } from "../../utils/test-utils";
import CustomerDashboardClient from "@/app/[locale]/(dashboard)/customer-dashboard/CustomerDashboardClient";

jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({
          data: { user: { id: "123", email: "test@example.com" } },
        }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));

// Mock penalty actions to prevent server-side cookies error
jest.mock("@/app/[locale]/penalties/penaltyActions", () => ({
  checkUserCanReserve: jest.fn().mockResolvedValue({
    status: {
      can_reserve: true,
      overdue_book_count: 0,
      restriction_reason: null,
    },
    error: null,
  }),
}));

// --- Mock next/navigation ---
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ locale: "en" })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("CustomerDashBoardClient", () => {
  it("renders with a mock user profile", async () => {
    await act(async () => {
      render(
        <CustomerDashboardClient
          userProfile={{
            created_at: new Date().toISOString(),
            email: "test@example.com",
            first_name: "Test",
            last_name: "User",
            is_active: true,
            penalty_count: 0,
            role: "customer",
            user_id: "123",
          }}
          userEmail="test@example.com"
        />
      );
    });
    await waitFor(() => {
      const matches = screen.getAllByText(/Test/i);
      expect(matches.length).toBeGreaterThan(0);

      // More specific checks:
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/User/i)).toBeInTheDocument();
    });
  });
});
