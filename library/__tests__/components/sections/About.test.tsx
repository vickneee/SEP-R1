import { render, screen } from '../../utils/test-utils'
import About from '@/components/sections/About'

describe('About Component', () => {

    it('renders about section with correct content', () => {
        render(<About/>)

        // Test main heading
        expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument()
        expect(screen.getByText('For Every Reader,')).toBeInTheDocument()
        expect(screen.getByText('A Favourite Book!')).toBeInTheDocument()

        // Test description text
        expect(screen.getByText(/Our library is a place to explore knowledge/)).toBeInTheDocument()
    })

    it ('has correct styling classes', () => {
        render(<About/>)

        // Test main section exists - use a more reliable selector
        const aboutSection = screen.getByText('For Every Reader,').closest('section')
        expect(aboutSection).toBeInTheDocument()
        expect(aboutSection).toHaveClass('w-full', 'h-[750px]')

        // Test heading has correct text color classes
        const heading = screen.getByRole('heading', {level: 2})
        expect(heading).toHaveClass( 'font-bold', 'mb-4')

        // Test highlighted text has orange color
        const highlightedText = screen.getByText('A Favourite Book!')
        expect(highlightedText).toHaveClass('text-orange-500')
    })
})
