import { render, screen } from '../../utils/test-utils'
import NavBar from "@/components/sections/NavBar";
jest.mock('@supabase/ssr');

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
    })),
}));

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
    it('renders navbar section with correct content', () => {
        render(<NavBar />)

        // Test text in NavBar
        expect(screen.getByText('LibraryHub')).toBeInTheDocument()
    })

    it('displays search functionality', () => {
        render(<NavBar />)

        // Test search input
        const searchInput = screen.getByPlaceholderText(/Search title, authors, or categories/)
        expect(searchInput).toBeInTheDocument()
        expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('has accessible structure', () => {
        render(<NavBar />)

        // Test semantic structure
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
})
