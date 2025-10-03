import { render, screen, act, waitFor } from "../../utils/test-utils";
import LibrarianDashboardClient from "@/app/(dashboard)/librarian-dashboard/LibrarianDashboardClient";

describe("CustomerDashBoardClient", () => {
  it("renders with a mock user profile", async () => {
    await act(async () => {
      render(
        <LibrarianDashboardClient
          userProfile={{
            created_at: new Date().toISOString(),
            email: "test@example.com",
            first_name: "Test",
            last_name: "User",
            is_active: true,
            penalty_count: 0,
            role: "librarian",
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
      expect(screen.getByText("Librarian Dashboard")).toBeInTheDocument();
      expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Test\s+User/i)).toBeInTheDocument();
      expect(screen.getAllByText(/librarian/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Active/i)).toBeInTheDocument();
    });
  });
});
