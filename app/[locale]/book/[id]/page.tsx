import { getBookById } from "@/app/[locale]/books/bookActions";
import BookPageClient from "./BookPageClient";
import { notFound } from "next/navigation";

interface BookPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
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
