import { getBookById } from "@/app/actions/bookActions";
import BookImage from "@/app/components/custom/BookImage";

export default async function BookPage({ params }: { params: { id: string } }) {
  const { book } = await getBookById(Number(params.id));

  return (
    <div className="flex flex-col items-center mx-auto mt-12 mb-16">
      <h1 className=" text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
        Book Information
      </h1>
      <div className="mt-2 w-[380px] px-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col items-center p-2">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-40 h-56 mb-6 mt-4 rounded-md"
            />
          ) : (
            <BookImage
              title={book.title}
              category={book.category}
            />
          )}

          <h2 className="text-center text-xl font-semibold mb-2">{book.title}</h2>
          <p className="text-sm text-gray-500 mb-1">
            Category: {book.category}
          </p>
          <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>

          <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
            <p>Author: {book.author}</p>
            <p>Publication year: {book.publication_year}</p>
            <p>Publisher: {book.publisher}</p>
            <p>Total copies: {book.total_copies}</p>
            <p>Available copies: {book.available_copies}</p>
          </div>

          <div className="py-6 flex justify-center">
            {book.available_copies === 0 ? (
              <button className="w-auto bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300">
                Checked out
              </button>
            ) : (
              <button className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300">
                Reserve this Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
