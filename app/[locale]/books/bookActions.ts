"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database";
// Type definitions for the "books" table
type Book = Database["public"]["Tables"]["books"]["Row"];
type BookInsert = Database["public"]["Tables"]["books"]["Insert"];
type BookUpdate = Database["public"]["Tables"]["books"]["Update"];
/**
 * Fetch all books from the database, ordered by creation date.
 */
const getAllBooks = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select(
      "book_id, title, author, category, image, available_copies, total_copies"
    )
    .order("created_at", { ascending: true });

  return {
    error: error ? error.message : null,
    books: data,
  };
};
/**
 * Search books by author name (case-insensitive).
 */
const getBooksByAuthor = async (search: string) => {
  if (!search?.trim()) {
    return { books: [], error: undefined };
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select(
      "book_id, title, author, category, image, available_copies, total_copies"
    )
    .ilike("author", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};
/**
 * Search books by title (case-insensitive).
 * If no search term is provided, return all books.
 */
const getBooksByTitle = async (search: string) => {
  if (!search?.trim()) {
    return await getAllBooks();
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select(
      "book_id, title, author, category, image, available_copies, total_copies"
    )
    .ilike("title", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};
/**
 * Search books by category (case-insensitive).
 */
const getBooksByCategory = async (search: string) => {
  if (!search?.trim()) {
    return { books: [], error: undefined };
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select(
      "book_id, title, author, category, image, available_copies, total_copies"
    )
    .ilike("category", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};
/**
 * Create a new book record in the database.
 * Validates required fields and image URL before inserting.
 */
const createBook = async (
  book: Omit<
    BookInsert,
    "book_id" | "created_at" | "updated_at" | "available_copies"
  > & {
    available_copies: number;
  },
  locale = "en"
) => {
  let messages = {
    error_invalid_image_url: "Image must be a valid URL.",
    error_unknown: "Unknown error",
  };
  // Load localized error messages if available
  try {
    const mod = await import(`../../../locales/${locale}/BookActions.json`);
    messages = (mod && (mod.default ?? mod)) as typeof messages;
  } catch {}

  try {
    // Validate required fields
    if (
      !book.title ||
      !book.author ||
      !book.category ||
      !book.isbn ||
      !book.publisher ||
      !book.publication_year ||
      !book.total_copies ||
      typeof book.available_copies !== "number"
    ) {
      return { error: "Missing required fields.", book: null };
    }
    // Validate image URL format
    if (book.image && !/^https?:\/\/.+\..+/.test(book.image)) {
      return { error: messages.error_invalid_image_url, book: null };
    }
    // Insert book into database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          title: book.title,
          author: book.author,
          image: book.image,
          category: book.category,
          isbn: book.isbn,
          publisher: book.publisher,
          publication_year: book.publication_year,
          total_copies: book.total_copies,
          available_copies: book.available_copies,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { error: error.message, book: null };
    }

    return { error: null, book: data };
  } catch (err: unknown) {
    console.error("createBook exception:", err);
    const errorMessage =
      err instanceof Error ? err.message : messages.error_unknown;
    return { error: errorMessage, book: null };
  }
};
/**
 * Fetch a single book by its ID.
 */
const getBookById = async (id: number) => {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("books")
    .select("*")
    .eq("book_id", id)
    .single();
  console.log(error);
  return {
    error: error?.message,
    book: data as Book,
  };
};
/**
 * Update an existing book record by ID.
 */
const updateBook = async (id: number, updates: BookUpdate) => {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("books")
    .update(updates)
    .eq("book_id", id)
    .select()
    .single();

  return { error: error?.message, book: data };
};
/**
 * Delete a book record by ID.
 */
const deleteBook = async (id: number) => {
  const supabase = await createClient();

  const { error } = await supabase.from("books").delete().eq("book_id", id);

  return { error: error?.message };
};
/**
 * Reserve a book for the current user.
 * Includes authentication check, penalty check, and reservation creation.
 */
const reserveBook = async (bookId: number, dueDate: string, locale = "en") => {
  let messages = {
    error_not_authenticated: "User not authenticated",
    error_reservation_verification_failed:
      "Failed to verify reservation eligibility",
    error_reservation_not_allowed: "You cannot make reservations at this time",
  };
  try {
    const mod = await import(`../../../locales/${locale}/BookActions.json`);
    messages = (mod && (mod.default ?? mod)) as typeof messages;
  } catch {}

  const supabase = await createClient();
  console.log("Reserve book", bookId);
  console.log("Due date", dueDate);

  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error("User authentication error:", userError);
    return {
      success: false,
      error: userError || new Error(messages.error_not_authenticated),
    };
  }

  // Check if user can make reservations (penalty check)
  const { data: canReserveData, error: reservationError } = await supabase.rpc(
    "can_user_reserve_books",
    {
      user_uuid: userData.user.id,
    }
  );

  if (reservationError) {
    console.error("Error checking user reservation status:", reservationError);
    return {
      success: false,
      error: new Error(messages.error_reservation_verification_failed),
    };
  }

  const reservationStatus = canReserveData?.[0];
  if (!reservationStatus?.can_reserve) {
    const message =
      reservationStatus?.restriction_reason ||
      messages.error_reservation_not_allowed;
    return { success: false, error: new Error(message) };
  }

  // Check if the book exists and has available copies
  const { error: bookError } = await supabase
    .from("books")
    .select("available_copies")
    .eq("book_id", bookId)
    .single();

  if (bookError) {
    console.error("Book fetch error:", bookError);
    return { success: false, error: bookError };
  }

  // Create a reservation
  const { data, error: insertError } = await supabase
    .from("reservations")
    .insert([{ book_id: bookId, due_date: dueDate, user_id: userData.user.id }])
    .select()
    .single();

  if (insertError) {
    console.error("Reservation insert error:", insertError);
    return { success: false, error: insertError };
  }

  return { success: true, data };
};
// Export all book-related functions
export {
  getAllBooks,
  getBooksByAuthor,
  getBooksByTitle,
  getBooksByCategory,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  reserveBook,
};
