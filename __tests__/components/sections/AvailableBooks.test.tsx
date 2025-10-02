import { render, screen } from '../../utils/test-utils'
import AvailableBooks, { Book } from "@/components/sections/AvailableBooks";

describe('AvailableBooks Component', () => {
    const mockBooks: Book[] = [
        {
            book_id: 1,
            title: "Book One",
            author: "Author A",
            image: "/book1.jpg",
            category: "Fiction",
            available_copies: 5,
            total_copies: 5,
            isbn: "978-1234567890",
            publication_year: 2020,
            publisher: "Test Publisher",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
        },
        {
            book_id: 2,
            title: "Book Two",
            author: "Author B",
            image: "/book2.jpg",
            category: "Science",
            available_copies: 3,
            total_copies: 5,
            isbn: "978-0987654321",
            publication_year: 2021,
            publisher: "Science Publisher",
            created_at: "2024-01-02T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z"
        }
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
