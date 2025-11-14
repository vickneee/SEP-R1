import { render, screen } from '../../utils/test-utils'
import Footer from '@/components/sections/Footer'
import {act, waitFor} from "@/__tests__/utils/test-utils";

// --- Mock next/navigation ---
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({locale: 'en'})),
    useRouter: jest.fn(() => ({push: jest.fn()})),
}));

describe('Footer Component', () => {

    it ('renders without crashing', async () => {
        render(<Footer/>);

        // Test footer element exists
        const footerElement = screen.getByRole('contentinfo')
        expect(footerElement).toBeInTheDocument()
    })

    it('renders footer with correct content', async () => {
        await act(async () => {
            render(<Footer/>);
        });

        // Test footer text
        await waitFor(() => {
            expect(screen.getByText(/© 2025 | LibraryHub/)).toBeInTheDocument()
        })
    })

    it('has correct styling classes', async () => {
        await act(async () => {
            render(<Footer/>);
        });

        await waitFor(() => {
        // Test text alignment
        const textElement = screen.getByText(/© 2025 | LibraryHub/)
        expect(textElement).toHaveClass('text-sm', 'mr-0')
        })
    })
})
