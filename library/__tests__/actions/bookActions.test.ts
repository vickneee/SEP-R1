import {
  getAllBooks,
  getBooksByAuthor,
  getBooksByTitle,
  getBooksByCategory,
  createBook,
  getBookById,
} from "@/app/actions/bookActions";

let createdBookIds: number[] = [];

beforeAll(async () => {
  const books = [
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      image: "https://via.placeholder.com/150?text=Pragmatic+Programmer",
      category: "Programming",
      isbn: "9780201616224",
      publisher: "Addison-Wesley",
      publication_year: 1999,
      total_copies: 10,
      available_copies: 10,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      image: "https://via.placeholder.com/150?text=Clean+Code",
      category: "Programming",
      isbn: "9780132350884",
      publisher: "Prentice Hall",
      publication_year: 2008,
      total_copies: 5,
      available_copies: 5,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      image: "https://via.placeholder.com/150?text=Atomic+Habits",
      category: "Self-help",
      isbn: "9780735211292",
      publisher: "Penguin",
      publication_year: 2018,
      total_copies: 7,
      available_copies: 7,
    },
  ];

  for (const book of books) {
    const result = await createBook(book);
    if (result.error) {
      console.error("❌ Failed to create book:", result.error);
    } else if (result.book) {
      createdBookIds.push(result.book.book_id);
      console.log("✅ Book created:", result.book.title);
    }
  }
});

describe("Supabase book actions", () => {
  it("should fetch all the books in database", async () => {
    const result = await getAllBooks();

    if (result.books) {
      expect(result.books.length).toBe(3);
    }
  });

  it("should fetch a book by id", async () => {
    const result = await getBookById(createdBookIds[0]);

    expect(result.book.title).toBe("The Pragmatic Programmer");
  });

  it("should fetch a book by Title", async () => {
    const result = await getBooksByTitle("Clean Code");

    if (result.books) {
      for (const book of result.books) {
        if (book.title == "Clean Code") {
          expect(book.author).toBe("Robert C. Martin");
        }
      }
    }
  });

  it("should fetch a book by Category", async () => {
    const result = await getBooksByCategory("Self-help");

    if (result.books) {
      for (const book of result.books) {
        if (book.category == "Self-help" && book.title) {
          expect(book.title).toBe("Atomic Habits");
        }
      }
    }
  });

  it("should fetch a book by Category", async () => {
    const result = await getBooksByAuthor("James Clear");

    if (result.books) {
      for (const book of result.books) {
        if (book.author == "James Clear") {
          expect(book.title).toBe("Atomic Habits");
        }
      }
    }
  });
});
