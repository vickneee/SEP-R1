import {render, screen, waitFor} from '../../utils/test-utils'
import NavBar from "@/components/sections/NavBar";
import {act} from "react";

// --- Mock next/navigation ---
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({locale: 'en'})),
    useRouter: jest.fn(() => ({push: jest.fn()})),
}));

jest.mock('@supabase/ssr');

// Mock the server-side APIs to avoid errors
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        get: jest.fn(() => undefined),
    })),
    headers: jest.fn(() => ({
        get: jest.fn(() => undefined),
    })),
}));

describe('NavBar Component', () => {

    it('renders navbar section with correct content', async () => {
        await act(async () => {
            render(<NavBar/>);
        });

        // Test text in NavBar
        await waitFor(() => {
            expect(screen.getByText('LibraryHub')).toBeInTheDocument()
        });
    });

    it('displays search functionality', async () => {
        await act(async () => {
            render(<NavBar/>);
        });

        // Test search input
            const searchInput = await screen.getByPlaceholderText(/Search by title, author, or categories.../)
            expect(searchInput).toBeInTheDocument()
            expect(searchInput).toHaveAttribute('type', 'text')
    });

    it('has accessible structure', async () => {
        await act(async () => {
            render(<NavBar/>)
        });

        // Test semantic structure
            expect(screen.getByRole('textbox')).toBeInTheDocument(); // Search input
            const signInButton = screen.getByRole('button', { name: /Sign In/i });
            expect(signInButton).toBeInTheDocument();
    });
});
