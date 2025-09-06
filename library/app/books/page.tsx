import { Books } from "@/app/components/custom/Books";
import { loadSearchParams } from "@/app/components/custom/search-params";
import type { SearchParams } from "nuqs/server";
import { getBooksByTitle } from "@/app/actions/bookActions";
import { getProducts } from "@/server/products";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BookPage({ searchParams }: PageProps) {
  const { search } = await loadSearchParams(searchParams);
  //const { books } = await getBooksByTitle({search});
  const books = await getProducts({ search });
  return <Books books={books} />;
}
