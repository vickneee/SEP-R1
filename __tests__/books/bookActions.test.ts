import * as booksModule from "../../app/[locale]/books/bookActions";
import * as supabaseModule from "../../utils/supabase/server";
import type { Database } from "@/types/database";

jest.mock("../../utils/supabase/server");

type Book = Database['public']['Tables']['books']['Row'];

// Centralized test data
const mockBooks: Book[] = [
  {
    book_id: 1,
    title: "Book One",
    author: "Author A",
    category: "Fiction",
    image: "https://example.com/image1.jpg",
    isbn: "123",
    publisher: "Pub",
    publication_year: 2020,
    total_copies: 5,
    available_copies: 5,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
  {
    book_id: 2,
    title: "Book Two",
    author: "Author B",
    category: "Non-fiction",
    image: "https://example.com/image2.jpg",
    isbn: "456",
    publisher: "Pub2",
    publication_year: 2021,
    total_copies: 3,
    available_copies: 3,
    created_at: "2025-02-01",
    updated_at: "2025-02-01",
  },
];

// Create a proper mock query builder that tracks method calls and resolves correctly
const createMockQueryBuilder = (resolveValue: { data: unknown; error: unknown } = { data: mockBooks, error: null }) => {
  const mockBuilder = {
    select: jest.fn(),
    order: jest.fn(),
    ilike: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
  };

  // Make all methods chainable and return the builder itself
  Object.keys(mockBuilder).forEach(key => {
    if (key !== 'single') {
      mockBuilder[key as keyof typeof mockBuilder].mockReturnValue(mockBuilder);
    }
  });

  // single() and the final promise resolution should return the actual data
  mockBuilder.single.mockResolvedValue(resolveValue);

  // Make the builder itself a thenable (promise-like) for direct awaiting
  (mockBuilder as unknown as { then: jest.Mock }).then = jest.fn((onResolve) => {
    return Promise.resolve(onResolve(resolveValue));
  });

  return mockBuilder;
};

// Global variables to hold current mock instances
let currentMockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

// Main mock Supabase client
const mockSupabase = {
  from: jest.fn(),
};

// Mock the createClient function
const createClientMock = supabaseModule.createClient as jest.MockedFunction<
  typeof supabaseModule.createClient
>;
createClientMock.mockReturnValue(Promise.resolve(mockSupabase as unknown as Awaited<ReturnType<typeof supabaseModule.createClient>>));

describe("Books module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the from mock for each test
    currentMockQueryBuilder = createMockQueryBuilder();
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);
  });

  test("getAllBooks returns data", async () => {
    // Set up mock to return our test data
    currentMockQueryBuilder = createMockQueryBuilder({ data: mockBooks, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const result = await booksModule.getAllBooks();

    expect(mockSupabase.from).toHaveBeenCalledWith("books");
    expect(result).toHaveProperty("books");
    expect(result.error).toBeNull();
  });

  test("getAllBooks returns a list of books", async () => {
    // Set up the mock to return our test data
    currentMockQueryBuilder = createMockQueryBuilder({ data: mockBooks, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const result = await booksModule.getAllBooks();

    expect(mockSupabase.from).toHaveBeenCalledWith("books");
    expect(result.books).not.toBeNull();
    expect(result.books).toHaveLength(2);
    expect(result.books![0]).toHaveProperty("title", "Book One");
    expect(result.books![1]).toHaveProperty("author", "Author B");
  });

  test("getBooksByAuthor returns empty array for blank search", async () => {
    const result = await booksModule.getBooksByAuthor("  ");

    // This test expects the function to return empty array without calling Supabase
    expect(result.books).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  test("getBooksByTitle returns all books for blank search", async () => {
    // Mock returning all books for blank title search
    currentMockQueryBuilder = createMockQueryBuilder({ data: mockBooks, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const result = await booksModule.getBooksByTitle("  ");

    expect(result.error).toBeNull();
    expect(result.books).toHaveLength(2);
  });

  test("createBook fails with missing fields", async () => {
    const result = await booksModule.createBook({
      title: "Book",
      author: "",
      image: "",
      category: "Fiction",
    } as Parameters<typeof booksModule.createBook>[0]);

    expect(result.error).toBe("Missing required fields.");
    expect(result.book).toBeNull();
  });

  test("createBook validates image URL", async () => {
    const result = await booksModule.createBook({
      title: "Book",
      author: "Author",
      category: "Fiction",
      image: "invalid-url",
      isbn: "123",
      publisher: "Pub",
      publication_year: 2020,
      total_copies: 5,
      available_copies: 5,
    });

    expect(result.error).toBe("Image must be a valid URL.");
  });

  test("createBook succeeds with valid fields", async () => {
    const newBook = {
      book_id: 3,
      title: "Valid Book",
      author: "Author",
      image: "https://example.com/image.jpg",
      category: "Fiction",
      isbn: "123",
      publisher: "Pub",
      publication_year: 2020,
      total_copies: 5,
      available_copies: 5,
      created_at: "2025-01-01",
      updated_at: "2025-01-01",
    };

    // Mock successful insert - note: single book object, not array
    currentMockQueryBuilder = createMockQueryBuilder({ data: newBook, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const result = await booksModule.createBook({
      title: "Valid Book",
      author: "Author",
      image: "https://example.com/image.jpg",
      category: "Fiction",
      isbn: "123",
      publisher: "Pub",
      publication_year: 2020,
      total_copies: 5,
      available_copies: 5,
    });

    expect(result.error).toBeNull();
    expect(result.book).toHaveProperty("book_id", 3);
    expect(result.book).toHaveProperty("title", "Valid Book");
  });

  test("getBookById calls Supabase with correct ID", async () => {
    // Mock returning a single book
    currentMockQueryBuilder = createMockQueryBuilder({ data: mockBooks[0], error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    await booksModule.getBookById(123);

    expect(mockSupabase.from).toHaveBeenCalledWith("books");
    expect(currentMockQueryBuilder.select).toHaveBeenCalled();
    expect(currentMockQueryBuilder.eq).toHaveBeenCalledWith("book_id", 123);
    expect(currentMockQueryBuilder.single).toHaveBeenCalled();
  });

  test("updateBook calls Supabase update", async () => {
    const updatedBook = { ...mockBooks[0], title: "Updated Title" };
    currentMockQueryBuilder = createMockQueryBuilder({ data: updatedBook, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    const updates = { title: "Updated Title" };
    await booksModule.updateBook(1, updates);

    expect(mockSupabase.from).toHaveBeenCalledWith("books");
    expect(currentMockQueryBuilder.update).toHaveBeenCalledWith(updates);
    expect(currentMockQueryBuilder.eq).toHaveBeenCalledWith("book_id", 1);
    expect(currentMockQueryBuilder.single).toHaveBeenCalled();
  });

  test("deleteBook calls Supabase delete", async () => {
    currentMockQueryBuilder = createMockQueryBuilder({ data: null, error: null });
    mockSupabase.from.mockReturnValue(currentMockQueryBuilder);

    await booksModule.deleteBook(1);

    expect(mockSupabase.from).toHaveBeenCalledWith("books");
    expect(currentMockQueryBuilder.delete).toHaveBeenCalled();
    expect(currentMockQueryBuilder.eq).toHaveBeenCalledWith("book_id", 1);
  });
});

