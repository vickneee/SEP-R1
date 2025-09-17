"use client";
import { Key } from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import BookImage from "@/components/custom/BookImage";
import { useRouter } from "next/navigation";
import Image from "next/image";

type BookForListing = {
  book_id: number;
  title: string;
  author: string;
  category: string;
  image: string | null;
};

interface BooksProps {
  books: BookForListing[] | null;
}

export function Books({ books }: BooksProps) {
  const router = useRouter();
  const handleClick = (id: Key | null | undefined) => {
    router.push(`/book/${id}`);
  };

  // Handle null or empty books
  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col gap-10 max-w-3xl mx-auto">
        <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
          Library Collection{" "}
        </h1>
        <p className="text-center text-gray-600">No books found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
        Library Collection{" "}
      </h1>
      <div className="grid grid-cols-3 gap-5 mb-16 min-w-[800px]">
        {books.map((book: BookForListing) => (
          <Card
            key={book.book_id}
            className="px-4 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100 flex flex-col justify-between"
          >
            <CardContent className="flex aspect-square items-center justify-center">
              {book.image ? (
                <Image
                  className="rounded-md"
                  src={book.image}
                  alt={book.title}
                  width={200}
                  height={300}
                />
              ) : (
                <BookImage
                  title={book.title}
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
