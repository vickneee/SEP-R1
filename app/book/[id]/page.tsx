import { getBookById } from "@/app/books/bookActions";
import BookPageClient from "./BookPageClient";
import { notFound } from "next/navigation";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = Number(id);
  console.log("Fetching book with ID:", bookId);
  const { book, error } = await getBookById(bookId);
  console.log("Book data:", book);

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading book</div>;
  }

  if (!book) return notFound();

  return <BookPageClient book={book} />;
}
