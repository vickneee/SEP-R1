import {render, screen, waitFor} from '../../utils/test-utils'
import userEvent from '@testing-library/user-event'
import Hero from '@/components/sections/Hero'
import {act} from "react";

// --- Mock next/navigation ---
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({locale: 'en'})),
    useRouter: jest.fn(() => ({push: jest.fn()})),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

describe('Hero Component', () => {

    it('renders hero section with correct content', async () => {
        render(<Hero/>);

        // Test main heading
        // Wait for headings with actual translated text
        const heading1 = await screen.findByText('Discover Your Next');
        const heading2 = await screen.findByText('Great Read');
        const paragraph = await screen.findByText(
            'Browse thousands of books, reserve your favorites, and manage your reading journey all in one place.'
        );

        expect(heading1).toBeInTheDocument();
        expect(heading2).toBeInTheDocument();
        expect(paragraph).toBeInTheDocument();
    })

    it('displays search functionality', async () => {
        await act(async () => {
            render(<Hero/>);
        });

        await waitFor(() => {
            // Test search input
            const searchInput = screen.getByPlaceholderText(/Search by title, author, or ISBN.../)
            expect(searchInput).toBeInTheDocument()
            expect(searchInput).toHaveAttribute('type', 'text')

            // Test search button
            const searchButton = screen.getByRole('button', {name: /search/i})
            expect(searchButton).toBeInTheDocument()

        })
    })

    it('allows user to type in search input', async () => {
        const user = userEvent.setup()
        render(<Hero/>);

        const searchInput = await screen.findByPlaceholderText(/Search by title, author, or ISBN.../)

        // Type in search input
        await user.type(searchInput, 'Harry Potter')
        expect(searchInput).toHaveValue('Harry Potter')
    })

    it('has correct styling classes', async () => {
        await act(async () => {
            render(<Hero/>);
        });

        await waitFor(() => {
            // Test main section exists - use a more reliable selector
            const heroSection = screen.getByText('Discover Your Next').closest('section')
            expect(heroSection).toBeInTheDocument()
            expect(heroSection).toHaveClass('relative', 'w-full')

            // Test heading has correct text color classes
            const heading = screen.getByRole('heading', {level: 1})
            expect(heading).toHaveClass('text-gray-200')

            // Test highlighted text has orange color
            const highlightedText = screen.getByText('Great Read')
            expect(highlightedText).toHaveClass('text-orange-500')
        })
    })

    it('renders background image with correct attributes', async () => {
        await act(async () => {
            render(<Hero/>);
        });

        await waitFor(() => {
            // Test background image
            const backgroundImage = screen.getByAltText('Bookshelf background')
            expect(backgroundImage).toBeInTheDocument()
            expect(backgroundImage).toHaveAttribute('src', '/hero-unsplash.jpg')
            expect(backgroundImage).toHaveAttribute('width', '1200')
            expect(backgroundImage).toHaveAttribute('height', '600')
        })
    })

    it('has accessible structure', async () => {
        await act(async () => {
            render(<Hero/>);
        });
        await waitFor(() => {

            // Test semantic structure
            expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument()
            expect(screen.getByRole('textbox')).toBeInTheDocument()
            expect(screen.getByRole('button')).toBeInTheDocument()
        })
    })
})
