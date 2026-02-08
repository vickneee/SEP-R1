import { getBookById } from "@/app/[locale]/books/bookActions";
import BookPageClient from "./BookPageClient";
import { notFound } from "next/navigation";
// Props definition for BookPage component
// `params` is a Promise that resolves to an object containing the book ID
interface BookPageProps {
  readonly params: Promise<{ readonly id: string }>;
}
// Server component for fetching a book by ID and rendering the client-side p
export default async function BookPage({ params }: BookPageProps) {
  // Await the params to extract the book ID
  const { id } = await params;
  const bookId = Number(id);
  console.log("Fetching book with ID:", bookId);
  // Fetch book data from Supabase using the provided ID
  const { book, error } = await getBookById(bookId);
  console.log("Book data:", book);
  // If an error occurs during fetch, display an error message
  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading book</div>;
  }
  // If no book is found, trigger Next.js `notFound()` to show 404 page
  if (!book) return notFound();
  // If book data is available, render the client-side BookPageClient component
  return <BookPageClient book={book} />;
}
