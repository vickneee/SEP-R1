"use client";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { books } from "@/data/books";
import BookImage from "@/app/components/custom/BookImage";
import { useRouter } from "next/navigation";

// @ts-ignore
export function Books({ books }) {
  const router = useRouter();
  const handleClick = (id: Key | null | undefined) => {
    router.push(`/book/${id}`);
  };

  // @ts-ignore
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
        Library Collection{" "}
      </h1>
      <div className="grid grid-cols-3 gap-5 mb-16 min-w-[800px]">
        {books.map(
          (book: {
            book_id: Key | null | undefined;
            id: Key | null | undefined;
            title:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
            category: string;
            author:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
            image: string;
            isbn: string;
            publisher: string;
            publication_year: number;
            total_copies: number;
            available_copies: number;
            created_at: string;
            updated_at: string;
            alt?: string | undefined
          }) => (
            <Card
              key={book.book_id}
              className="px-4 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100 flex flex-col justify-between"
            >
              <CardContent className="flex aspect-square items-center justify-center">
                {book.image ? (
                  <img className="rounded-md"
                    src={book.image}
                    alt={typeof book.title === "string" ? book.title : undefined}
                    width={200}
                    height={300}
                  />
                ) : (
                  <BookImage
                    title={typeof book.title === "string" ? book.title : ""}
                    category={book.category}
                  />
                )}
              </CardContent>
              <CardTitle className="text-center text-lg font-medium">
                {book.title}
              </CardTitle>
              <CardContent className="mt-[-22px] text-center text-sm text-gray-600">
                {book.author}
              </CardContent>
              <div className="flex justify-center mt-[-10px]">
                <button
                  onClick={() => handleClick(book.book_id)}
                  className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300"
                >
                  See details
                </button>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
