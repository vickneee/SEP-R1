import { getBookById } from "@/app/actions/bookActions";
import BookPageClient from "./BookPageClient";
import { notFound } from "next/navigation";

export default async function BookPage({ params }: { params: { id: string } }) {
  const { book } = await getBookById(Number(params.id));
  console.log("Book data:", book);

  if (!book) {
    notFound();
  }

  return <BookPageClient book={book} />;
}
