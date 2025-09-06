"use client";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState} from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {books} from "@/data/books";
import BookImage from "@/app/components/custom/BookImage";
import {getAllBooks} from "@/app/actions/bookActions";

interface Book {
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  category: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

// @ts-ignore
export function Books({books}) {
  /*
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");

  const fetchAllBooks = async () => {
    const { error, data } = await getAllBooks();
    if (error) {
      setError(error);
      return;
    } else if (data == null) {
      setError("No data is available now.");
    }

    setBooks(data);
  };

  useEffect(() => {
    fetchAllBooks();
  });
  */

  // @ts-ignore
  return (
      <div className="flex flex-col gap-10 max-w-3xl mx-auto">
        <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
          Library Collection </h1>
        <div className="grid grid-cols-4 gap-5">
          {books.map((book: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; category: string; author: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
          <Card
            key={book.id}
            className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100 flex flex-col justify-between"
          >
            <CardContent className="flex aspect-square items-center justify-center">
              <BookImage title={typeof book.title === "string" ? book.title : ""} category={book.category} />
            </CardContent>
            <CardTitle className="text-center text-lg font-medium">
              {book.title}
            </CardTitle>
            <CardContent className="mt-[-12px] text-center text-sm text-gray-600">
              {book.author}
            </CardContent>
            <div className="flex justify-center">
              <button className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300">
                See details
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
