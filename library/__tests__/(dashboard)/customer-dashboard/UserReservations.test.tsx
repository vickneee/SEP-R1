import {render, screen, act, waitFor} from '../../utils/test-utils'
import UserReservations from '@/app/(dashboard)/customer-dashboard/UserReservations';
import CustomerDashboardClient from '@/app/(dashboard)/customer-dashboard/CustomerDashboardClient';

// Mock Supabase client for client-side
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: jest.fn().mockResolvedValue({data: {user: {id: '123', email: 'test@example.com'}}}),
        },
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
                data: [
                    {
                        reservation_id: 1,
                        reservation_date: new Date().toISOString(),
                        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
                        return_date: null,
                        status: 'active',
                        books: {title: 'Test Book', author: 'Author A'},
                    },
                ], error: null
            }),
        }),
    }),
}));

describe('UserReservations Component', () => {
    it("renders reservations without crashing", async () => {
        await act(async () => {
            render(<UserReservations/>);
        });

        await waitFor(() => {
            expect(screen.getByText(/Test Book/i)).toBeInTheDocument();
            expect(screen.getByText(/Author A/i)).toBeInTheDocument();
            expect(screen.getByText(/active/i)).toBeInTheDocument();
        })
    });

    it("renders CustomerDashboardClient with mock profile", async () => {
        await act(async () => {
            render(
                <CustomerDashboardClient userProfile={{
                    created_at: new Date().toISOString(),
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    is_active: true,
                    penalty_count: 0,
                    role: 'customer',
                    user_id: '123',
                }} userEmail="test@example.com"/>
            );
        });

        // Heading check
        const heading = screen.getByRole('heading', {name: /Welcome, Test/i});
        expect(heading).toBeInTheDocument();

        const matches = screen.getAllByText(/Test/i);
        expect(matches.length).toBeGreaterThan(0);

        // Email check
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
});
