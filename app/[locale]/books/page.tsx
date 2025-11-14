import { Books } from "@/components/custom/Books";
import { loadSearchParams } from "@/components/custom/search-params";
import type { SearchParams } from "nuqs/server";
import { getBooksByTitle } from "@/app/[locale]/books/bookActions";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BookPage({ searchParams }: PageProps) {
  const { search } = await loadSearchParams(searchParams);
  const { error, books } = await getBooksByTitle(search);

  const safeBooks = (books || []).map((book) => ({
    ...book,
    image: book.image ?? "",
  }));

  // display an error message when data fetching fails
  if (error) {
    return (
      <div className="text-red-600 bg-red-100 border border-red-400 rounded p-3">
        {error}
      </div>
    );
  }

  // render the list og books when no error occurs
  return <Books books={safeBooks} />;
}
