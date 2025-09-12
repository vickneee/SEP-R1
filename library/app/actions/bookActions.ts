"use server";

import { createClient } from "@/utils/supabase/server";
import { id } from "zod/locales";

interface Book {
  image: string;
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  category: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

const getAllBooks = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select("book_id, title, author, category")
    .order("created_at", { ascending: true });

  return {
    error: error?.message,
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

const createBook = async (book: {
  title: string;
  author: string;
  image: string;
  category: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  total_copies?: number;
  available_copies?: number;
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
  } catch (err: any) {
    console.error("createBook exception:", err);
    return { error: err.message || "Unknown error", book: null };
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

const updateBook = async (id: number, updates: Partial<Book>) => {
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

export {
  getAllBooks,
  getBooksByAuthor,
  getBooksByTitle,
  getBooksByCategory,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
