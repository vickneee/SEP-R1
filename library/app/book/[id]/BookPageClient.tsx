"use client";

import { reserveBook } from "@/app/actions/clientActions";
import BookImage from "@/app/components/custom/BookImage";
import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";

export default function BookPageClient({ book: initialBook }: { book: any }) {
    const router = useRouter();
    const [book, setBook] = useState(initialBook);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (message && isSuccess) {
            const timer = setTimeout(() => {
                router.push('/private');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [message, isSuccess, router]);

    const handleReserve = async () => {
        setLoading(true);
        setMessage("");
        try {
            if (!initialBook || initialBook.available_copies === 0) {
                setMessage("No available copies to reserve.");
                setIsSuccess(false);
                setLoading(false);
                return;
            }
            const due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const result = await reserveBook(initialBook.book_id, due_date);
            console.log("Book ID", initialBook.book_id);
            console.log("Due date", due_date);
            console.log("Reservation result", result);
            if (result.success) {
                setMessage("Reservation successful!");
                setIsSuccess(true);
            } else {
                setMessage("Reservation failed.");
                setIsSuccess(false);
            }
        } catch {
            setMessage("An error occurred.");
            setIsSuccess(false);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center mx-auto mt-12 mb-16">
            <h1 className=" text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                Book Information
            </h1>
            <div className="mt-2 w-[380px] px-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col items-center p-2">
                    {initialBook.image ? (
                        <img
                            src={initialBook.image}
                            alt={initialBook.title}
                            className="w-40 h-56 mb-6 mt-4 rounded-md"
                        />
                    ) : (
                        <BookImage
                            title={initialBook.title}
                            category={initialBook.category}
                        />
                    )}

                    <h2 className="text-center text-xl font-semibold mb-2">{initialBook.title}</h2>
                    <p className="text-sm text-gray-500 mb-1">
                        Category: {initialBook.category}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">ISBN: {initialBook.isbn}</p>

                    <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                        <p>Author: {initialBook.author}</p>
                        <p>Publication year: {initialBook.publication_year}</p>
                        <p>Publisher: {initialBook.publisher}</p>
                        <p>Total copies: {initialBook.total_copies}</p>
                        <p>Available copies: {initialBook.available_copies}</p>
                    </div>

                    <div className="py-7 flex justify-center">
                        {initialBook.available_copies === 0 ? (
                            <button className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300">
                                Checked out
                            </button>
                        ) : (
                            <button
                                className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300"
                                onClick={handleReserve}
                                disabled={loading}
                            >
                                {loading ? "Reserving..." : "Reserve this Book"}
                            </button>
                        )}
                    </div>
                    {message && <p className={`mb-6 text-center text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>}
                </div>
            </div>
        </div>
    );
}
