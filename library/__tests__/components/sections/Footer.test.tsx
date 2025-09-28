import { render, screen } from '../../utils/test-utils'
import Footer from '@/components/sections/Footer'

describe('Footer Component', () => {

    it ('renders without crashing', () => {
        render(<Footer />)

        // Test footer element exists
        const footerElement = screen.getByRole('contentinfo')
        expect(footerElement).toBeInTheDocument()
    })

    it('renders footer with correct content', () => {
        render(<Footer />)

        // Test footer text
        expect(screen.getByText(/© 2025 | LibraryHub/)).toBeInTheDocument()
    })

    it('has correct styling classes', () => {
        render(<Footer />)

        // Test text alignment
        const textElement = screen.getByText(/© 2024 | LibraryHub/)
        expect(textElement).toHaveClass('text-sm', 'mr-0')
    })
})
