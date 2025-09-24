import {render, screen, act, waitFor} from '../../utils/test-utils'
import UserReservations from '@/app/(dashboard)/customer-dashboard/UserReservations';
import CustomerDashboardClient from '@/app/(dashboard)/customer-dashboard/CustomerDashboardClient';
import {fireEvent} from "@testing-library/dom";
import {extendReservation} from "@/app/books/extendedAction";

type Reservation = {
    reservation_id: number;
    reservation_date: string;
    due_date: string;
    return_date: string | null;
    status: "active" | "returned" | "overdue" | "cancelled";
    extended: boolean;
    books: {
        title: string;
        author: string;
    };
};

// Mock Supabase client for client-side
const createMockClient = (reservations: Reservation[]) => ({
    auth: {
        getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
        }),
    },
    from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
            data: reservations,
            error: null,
        }),
    }),
});

// Make createClient a Jest mock
const mockCreateClient = jest.fn();
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => mockCreateClient(),
}));

// Mock extendReservation API
jest.mock("@/app/books/extendedAction", () => ({
    extendReservation: jest.fn(),
}));

const mockedExtendReservation = extendReservation as jest.MockedFunction<typeof extendReservation>;

// Test user with reservations
describe('UserReservations Component', () => {
    it('renders reservations when user has some', async () => {
        mockCreateClient.mockReturnValueOnce(
            createMockClient([
                {
                    reservation_id: 1,
                    reservation_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    return_date: null,
                    status: 'active',
                    extended: false,
                    books: { title: 'Test Book', author: 'Author A' },
                },
            ])
        );

        render(<UserReservations />);

        await waitFor(() => {
            expect(screen.getByText(/Test Book/i)).toBeInTheDocument();
            expect(screen.getByText(/Author A/i)).toBeInTheDocument();
            expect(screen.getByText(/active/i)).toBeInTheDocument();
        });
    });

    it("renders reservations without crashing", async () => {
        mockCreateClient.mockReturnValueOnce(
            createMockClient([
                {
                    reservation_id: 1,
                    reservation_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    return_date: null,
                    status: 'active',
                    extended: false,
                    books: { title: 'Test Book', author: 'Author A' },
                },
            ])
        );

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
        mockCreateClient.mockReturnValueOnce(
            createMockClient([
                {
                    reservation_id: 1,
                    reservation_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    return_date: null,
                    status: 'active',
                    extended: false,
                    books: { title: 'Test Book', author: 'Author A' },
                },
            ])
        );

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

    it ('shows "You don’t have any borrowed books." when the user has none', async () => {
        mockCreateClient.mockReturnValueOnce(createMockClient([]));
        await act(async () => {
            render(<UserReservations />);
        })

        await waitFor(() => {
            const emptyMessage = screen.getByText((content, element) => {
                return element?.tagName.toLowerCase() === 'p' &&
                    content.includes("You don’t have any borrowed books");
            });
            expect(emptyMessage).toBeInTheDocument();
        });
    });

    it('renders reservation due date', async () => {
        const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

        mockCreateClient.mockReturnValueOnce(
            createMockClient([
                {
                    reservation_id: 1,
                    reservation_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), //
                    return_date: null,
                    status: 'active',
                    extended: false,
                    books: { title: 'Test Book', author: 'Author A' },
                },
            ])
        );

        render(<UserReservations />);

        const formatted = dueDate.split('T')[0]; // "2025-09-25"
        await waitFor(() => {
            expect(screen.getByText(new RegExp(formatted.replace(/-/g, '[-/]'), 'i'))).toBeInTheDocument();
        });
    });

    it('should extend a reservation successfully', async () => {
        const initialReservation = {
            reservation_id: 1,
            reservation_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            return_date: null,
            status: "active" as const,
            extended: false,
            books: { title: "Test Book", author: "Author A" },
        };

        const updatedReservation = { ...initialReservation, extended: true };

        mockCreateClient.mockReturnValueOnce(createMockClient([initialReservation]));
        mockedExtendReservation.mockResolvedValueOnce(updatedReservation);

        // Act: render + click "Extend"
        render(<UserReservations />);
        const button = await screen.findByRole("button", { name: /extend/i });
        fireEvent.click(button);

        // Assert
        await waitFor(() => {
            expect(mockedExtendReservation).toHaveBeenCalledWith(1);
            expect(screen.getByText(/Book extended successfully!/i)).toBeInTheDocument();
        });
    });

    it('should not extend a reservation twice', async () => {
        const initialReservation2 = {
            reservation_id: 1,
            reservation_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            return_date: null,
            status: "active" as const,
            extended: false,
            books: { title: "Test Book", author: "Author A" },
        };

        const updatedReservation2 = { ...initialReservation2, extended: true };

        mockCreateClient.mockReturnValueOnce(createMockClient([initialReservation2]));
        mockedExtendReservation.mockResolvedValueOnce(updatedReservation2);

        render(<UserReservations />);

        // First click should work
        const button = await screen.findByRole("button", { name: /Extend/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockedExtendReservation).toHaveBeenCalledWith(1);
            expect(screen.getByText(/Book extended successfully!/i)).toBeInTheDocument();
        });

        // wait for update: API called + feedback + new button text
        await waitFor(() => {
            expect(mockedExtendReservation).toHaveBeenCalledWith(1);
            expect(screen.getByText(/Book extended successfully!/i)).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /Extended/i })
            ).toBeDisabled();
        });

        await waitFor(() => {
            expect(mockedExtendReservation).toHaveBeenCalledWith(1);
            expect(button).toBeDisabled();
        });
    });

});
