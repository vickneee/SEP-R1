"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database";

type Book = Database['public']['Tables']['books']['Row'];
type BookInsert = Database['public']['Tables']['books']['Insert'];
type BookUpdate = Database['public']['Tables']['books']['Update'];

const getAllBooks = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select("book_id, title, image, author, category")
    .order("created_at", { ascending: true });

  return {
    error: error ? error.message : null,
    books: data,
  };
};

const getBooksByAuthor = async (search: string) => {
  if (!search?.trim()) {
    return { books: [], error: undefined };
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select("book_id, title, author, category")
    .ilike("author", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};

const getBooksByTitle = async (search: string) => {
  if (!search?.trim()) {
    return await getAllBooks();
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select("book_id, title, author, category, image")
    .ilike("title", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};

const getBooksByCategory = async (search: string) => {
  if (!search?.trim()) {
    return { books: [], error: undefined };
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select("book_id, title, author, category")
    .ilike("category", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};

const createBook = async (book: Omit<BookInsert, 'book_id' | 'created_at' | 'updated_at' | 'available_copies'> & {
  available_copies: number;
}) => {
  try {
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

    if (
      book.image &&
      !/^https?:\/\/.+\..+/.test(book.image)
    ) {
      return { error: "Image must be a valid URL.", book: null };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("books")
      .insert([{
        title: book.title,
        author: book.author,
        image: book.image,
        category: book.category,
        isbn: book.isbn,
        publisher: book.publisher,
        publication_year: book.publication_year,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { error: error.message, book: null };
    }

    return { error: null, book: data };
  } catch (err: unknown) {
    console.error("createBook exception:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { error: errorMessage, book: null };
  }
};

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

const deleteBook = async (id: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .delete()
    .eq("book_id", id)
    .select()
    .single();

  return { error: error?.message, book: data };
};

const reserveBook = async (bookId: number, dueDate: string) => {
  const supabase = await createClient();
  console.log("Reserve book", bookId);
  console.log("Due date", dueDate);

  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error("User authentication error:", userError);
    return { success: false, error: userError || new Error("User not authenticated") };
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
}

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
