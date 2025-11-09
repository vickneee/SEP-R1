import { createClient } from "@/utils/supabase/server";
import * as CustomerDashboardModule from "@/app/[locale]/(dashboard)/customer-dashboard/page"
const CustomerDashboard = CustomerDashboardModule.default;

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

jest.mock("@/utils/supabase/server", () => ({
    createClient: jest.fn(),
}));

describe("CustomerDashboard server component", () => {
    const mockCreateClient = createClient as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders CustomerDashboardClient for a valid customer", async () => {
        mockCreateClient.mockResolvedValueOnce({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123", email: "test@example.com" } }, error: null }) },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: "123", role: "customer", first_name: "Test", last_name: "User" },
                    error: null,
                }),
            }),
        });

        const result = await CustomerDashboard({ params: { locale: "en" } });

        expect(result.type.name).toBe("CustomerDashboardClient");
        expect(result.props.userEmail).toBe("test@example.com");
        expect(result.props.userProfile.role).toBe("customer");
    });
});
