// Books.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Books } from "@/components/custom/Books";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: () => ({ locale: "en" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

jest.mock("@/app/i18n", () => ({
  __esModule: true,
  default: async () => ({
    t: (key: string) => key,
  }),
  initTranslations: async () => ({
    t: (key: string) => key,
  }),
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
        available_copies: 0,
      },
      {
        book_id: 2,
        title: "Available Book",
        author: "Author Two",
        category: "Fiction",
        available_copies: 1,
      },
    ];

    render(<Books books={books} />);

    expect(screen.getByText("book_unavailable")).toBeInTheDocument();

    const unavailableButton = screen.getAllByText("see_details")[0];
    expect(unavailableButton).toBeDisabled();
  });

  it("calls router.push when clicking available book button", () => {
    const books = [
      {
        book_id: 2,
        title: "Available Book",
        author: "Author Two",
        category: "Fiction",
        available_copies: 1,
      },
    ];

    render(<Books books={books} />);

    const button = screen.getByText("see_details");
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/book/2");
  });
});
