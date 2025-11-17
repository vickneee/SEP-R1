import { render, screen, act, waitFor } from "../../utils/test-utils";
import LibrarianDashboardClient from "@/app/[locale]/(dashboard)/librarian-dashboard/LibrarianDashboardClient";
import userEvent from "@testing-library/user-event";

jest.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'en' }),
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

describe("LibrarianDashBoardClient", () => {

    it("renders with a mock user profile", async () => {
        await act(async () => {
            render(
                <LibrarianDashboardClient userProfile={{
                    created_at: new Date().toISOString(),
                    email: "test@example.com",
                    first_name: "Test",
                    last_name: "User",
                    is_active: true,
                    penalty_count: 0,
                    role: "librarian",
                    user_id: "123",
                }} userEmail="test@example.com" />
            );
        });
        await waitFor(() => {
            const matches = screen.getAllByText(/Test/i);
            expect(matches.length).toBeGreaterThan(0);

            // More specific checks:
            expect(screen.getByText("Librarian Dashboard")).toBeInTheDocument();
            expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/Test\s+User/i)).toBeInTheDocument();
            expect(screen.getAllByText(/librarian/i).length).toBeGreaterThan(0);
            expect(screen.getByText(/Active/i)).toBeInTheDocument();
        }); 
    });

    it("does not submit the form if required fields are missing", async () => {
        const fetchSpy = jest.spyOn(globalThis, "fetch");
        render(
            <LibrarianDashboardClient userProfile={{
                created_at: "2025-10-05T00:00:00.000Z",
                email: "librarian@example.com",
                first_name: "Libby",
                last_name: "Smith",
                is_active: true,
                penalty_count: 0,
                role: "librarian",
                user_id: "lib-1",
            }} userEmail="librarian@example.com" />
        );
        // Only fill in the title
        await userEvent.type(screen.getByPlaceholderText("book_title_label"), "Test Book");

        await userEvent.click(screen.getByRole("button", { name: /add book/i }));

        // Fetch should not be called because the form is invalid
        expect(fetchSpy).not.toHaveBeenCalled();

        fetchSpy.mockRestore();
    });

    it("submits the form when all required fields are filled", async () => {
        const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({ message: "Book added successfully" }),
        } as Response);

        render(
            <LibrarianDashboardClient userProfile={{
                created_at: "2025-10-05T00:00:00.000Z",
                email: "ville.kalle@library.com",
                first_name: "Ville",
                last_name: "Kalle",
                is_active: true,
                penalty_count: 0,
                role: "librarian",
                user_id: "lib-1",
            }} userEmail="ville.kalle@library.com" />
        );

        // Fill in all required fields
        await userEvent.type(screen.getByPlaceholderText("book_title_label"), "Test Book");
        await userEvent.type(screen.getByPlaceholderText("Author"), "Test Author");
        await userEvent.type(screen.getByPlaceholderText("Image URL"), "http://example.com/image.jpg");
        await userEvent.type(screen.getByPlaceholderText("Category"), "Fiction");
        await userEvent.type(screen.getByPlaceholderText("ISBN"), "1234567890");
        await userEvent.type(screen.getByPlaceholderText("Publisher"), "Test Publisher");
        // await userEvent.clear(screen.getByLabelText("book_publication_year_label"));
        // await userEvent.type(screen.getByLabelText("Publication Year:"), "2025");
        await userEvent.clear(screen.getByPlaceholderText("Total Copies"));
        await userEvent.type(screen.getByPlaceholderText("Total Copies"), "1");
        await userEvent.clear(screen.getByPlaceholderText("Available Copies"));
        await userEvent.type(screen.getByPlaceholderText("Available Copies"), "1");

        await userEvent.click(screen.getByRole("button", { name: /add book/i }));

        // Wait for any asynchronous actions to complete
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith("/api/books", expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test Book",
                    author: "Test Author",
                    image: "http://example.com/image.jpg",
                    category: "Fiction",
                    isbn: "1234567890",
                    publisher: "Test Publisher",
                    publication_year: 2025,
                    total_copies: 1,
                    available_copies: 1,
                }),
            }));
        });

        fetchSpy.mockRestore();
    }, 10000); // Increase timeout to 10 seconds for coverage runs
});
