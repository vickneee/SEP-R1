import { render, screen } from '../../utils/test-utils'
import AvailableBooks, { Book } from "@/components/sections/AvailableBooks";

describe('AvailableBooks Component', () => {
    const mockBooks: Book[] = [
        { book_id: 1, title: "Book One", author: "Author A", image: "/book1.jpg", category: "Fiction" },
        { book_id: 2, title: "Book Two", author: "Author B", image: "/book2.jpg", category: "Science" }
    ]

    it('renders Available Books heading', () => {
        render(<AvailableBooks books={mockBooks} error={null} />)

        // Test main heading exists
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
        expect(screen.getByText('Available Books')).toBeInTheDocument()
    })

    it('renders list of books', () => {
        render(<AvailableBooks books={mockBooks} error={null} />)

        // Test that book titles are rendered
        expect(screen.getByText('Book One')).toBeInTheDocument()
        expect(screen.getByText('Book Two')).toBeInTheDocument()

        // Test that authors are rendered
        expect(screen.getByText('Author A')).toBeInTheDocument()
        expect(screen.getByText('Author B')).toBeInTheDocument()
    })
})
