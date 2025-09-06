"use server";
//this is fake api to test filtering for books page
import { unstable_cache } from "next/cache";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
  };
  images: string[];
}
interface GetProductsParams {
  search?: string;
}

/*export async function getProducts({
  search,
}: GetProductsParams): Promise<Product[]> {
  console.log(search);
  const res = await fetch(
    `https://api.escuelajs.co/api/v1/products/?title=${search}`
  );
  const data = await res.json();
  return data;
}*/

export const getProducts = unstable_cache(
  async (params: GetProductsParams): Promise<Product[]> => {
    const res = await fetch(
      `https://api.escuelajs.co/api/v1/products/?title=${params.search}`
    );
    const data = await res.json();

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return data;
  },
  ["products"],
  {
    tags: ["products"],
  }
);
