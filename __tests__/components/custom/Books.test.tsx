// Books.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Books } from "@/components/custom/Books";
import { useRouter } from "next/navigation";

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Books Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'Currently unavailable' for books with 0 available copies", () => {
    const books = [
      {
        book_id: 1,
        title: "Unavailable Book",
        author: "Author One",
        category: "Fiction",
        image: "",
        available_copies: 0,
      },
      {
        book_id: 2,
        title: "Available Book",
        author: "Author Two",
        category: "Non-Fiction",
        image: "",
        available_copies: 3,
      },
    ];

    render(<Books books={books} />);

    // Check for the unavailable notice
    expect(screen.getByText("Currently unavailable")).toBeInTheDocument();

    // Check that the "See details" button is disabled for the unavailable book
    const unavailableButton = screen.getAllByText("See details")[0];
    expect(unavailableButton).toBeDisabled();

    // Check that the available book button is not disabled
    const availableButton = screen.getAllByText("See details")[1];
    expect(availableButton).not.toBeDisabled();
  });

  it("calls router.push when clicking available book button", () => {
    const books = [
      {
        book_id: 2,
        title: "Available Book",
        author: "Author Two",
        category: "Non-Fiction",
        image: "",
        available_copies: 3,
      },
    ];

    render(<Books books={books} />);

    const button = screen.getByText("See details");
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/book/2");
  });
});
