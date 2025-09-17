import { Books } from "@/components/custom/Books";
import { loadSearchParams } from "@/components/custom/search-params";
import type { SearchParams } from "nuqs/server";
import { getBooksByTitle } from "@/app/books/bookActions";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BookPage({ searchParams }: PageProps) {
  const { search } = await loadSearchParams(searchParams);
  const { books } = await getBooksByTitle(search);

  // Ensure books is never null - fallback to empty array
  const safeBooks = books || [];

  return <Books books={safeBooks} />;
}
