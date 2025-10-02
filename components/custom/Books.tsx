"use client";

import { Key } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3 } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import BookImage from "./BookImage";
import { deleteBook } from "@/app/books/bookActions";
import Image from "next/image";

interface Book {
  book_id: number;
  title: string;
  author: string;
  category: string;
  image?: string;
  available_copies: number;
}

interface BooksProps {
  books: Book[];
}

export function Books({ books }: BooksProps) {
  const router = useRouter();

  const handleClick = (id: Key) => {
    router.push(`/book/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, bookId: Key) => {
    e.stopPropagation();
    router.push(`/book/edit/${bookId}`);
  };

  const handleDelete = async (e: React.MouseEvent, bookId: Key) => {
    e.stopPropagation();
    try {
      const result = await deleteBook(Number(bookId));
      if (result.error) {
        alert("Failed to delete book: " + result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while deleting the book.");
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center">
        Library Collection
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-16">
        {books.map((book) => (
          <Card
            key={book.book_id}
            className="px-4 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100 flex flex-col justify-between group relative"
          >
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                onClick={(e) => handleEdit(e, book.book_id)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                aria-label="Edit book"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => handleDelete(e, book.book_id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                aria-label="Delete book"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Book Image */}
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
                <BookImage title={book.title} category={book.category} />
              )}
            </CardContent>

            {/* Book Info */}
            <CardTitle className="text-center text-lg font-medium">
              {book.title}
            </CardTitle>
            <CardContent className="mt-[-22px] text-center text-sm text-gray-600">
              {book.author}
            </CardContent>

            {/* Unavailable notice */}
            {book.available_copies === 0 && (
              <p className="text-center text-red-600 font-semibold mt-2">
                Currently unavailable
              </p>
            )}

            {/* See Details Button */}
            <div className="flex justify-center mt-[-10px]">
              <button
                onClick={() => handleClick(book.book_id)}
                className={`w-auto px-6 py-2 rounded transition-colors duration-300 ${
                  book.available_copies === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#552A1B] text-white hover:bg-[#E46A07]"
                }`}
                disabled={book.available_copies === 0}
              >
                See details
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
