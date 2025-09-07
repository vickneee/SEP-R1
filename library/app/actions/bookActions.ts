"use server";

import { createClient } from "@/utils/supabase/server";

interface Book {
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
    return { books: [], error: undefined }
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
    return { books: [], error: undefined }
  }

  const supabase = await createClient();

  const { error, data } = await supabase
    .from("books")
    .select("book_id, title, author, category")
    .ilike("title", `%${search}%`);

  return {
    error: error?.message,
    books: data,
  };
};

const getBooksByCategory = async (search: string) => {
  if (!search?.trim()) {
    return { books: [], error: undefined }
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

export { getAllBooks, getBooksByAuthor, getBooksByTitle, getBooksByCategory };
