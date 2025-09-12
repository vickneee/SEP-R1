import { getBookById } from "@/app/actions/bookActions";
import BookPageClient from "./BookPageClient";
import { notFound } from "next/navigation";

export default async function BookPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  console.log("Fetching book with ID:", id);
  const { book, error } = await getBookById(Number(id));
  console.log("Book data:", book);

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading book</div>;
  }

  if (!book) return notFound();

  return <BookPageClient book={book} />;
}
