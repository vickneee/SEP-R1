"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import type { Database } from "@/types/database";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useEffect, useState} from "react"; // Importing useEffect and useState
import {useLocaleParams} from "@/hooks/useLocaleParams";

export type Book = Database['public']['Tables']['books']['Row'];

interface Props {
    books: Book[] | null;
    error: string | null;
}

function AvailableBooks({ books, error }: Props) {
    const params = useLocaleParams() as { locale?: string } | null; // Type assertion for params
    const locale = params?.locale ?? 'en'; // Default to 'en' if locale is not provided
    const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

    // Load translations when locale changes
    useEffect(() => {
        const loadTranslations = async () => {
            const translations = await initTranslations(locale, ['Home']);
            setT(() => translations.t);
        };
        loadTranslations();
    }, [locale]);

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-red-600">Failed to load books: {error}</p>
            </div>
        );
    }

    if (!books || books.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>No books available.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[750px] sm:px-8 md:px-16 py-12">
            <h2 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                {t('available_books_header_2')}
            </h2>
            <div className="flex justify-center mt-10 mb-8 overflow-hidden">
                <Carousel className="w-full max-w-1/2 sm:max-w-1/2 lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
                    <CarouselContent className="-ml-1">
                        {books.map((book, index) => (
                            <CarouselItem key={book.book_id ?? index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                <div className="p-4">
                                    <Card className="px-4 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100">
                                        <CardContent className="flex items-center justify-center">
                                            {book.image ? (
                                                <Image
                                                    src={book.image}
                                                    alt={`Book Cover ${book.title}`}
                                                    width={200}
                                                    height={250}
                                                    className="object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-[200px] h-[250px] bg-gray-200 rounded-md flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm">No Image</span>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardTitle className="text-center text-lg font-medium">
                                            {book.title}
                                        </CardTitle>
                                        <CardContent className="mt-[-12px] text-center text-sm text-gray-600">
                                            {book.author}
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious
                        className="text-orange-600 hover:shadow-lg transition-shadow duration-300 cursor-pointer" />
                    <CarouselNext
                        className="text-orange-600 hover:shadow-lg transition-shadow duration-300 cursor-pointer" />
                </Carousel>
            </div>
        </div>
    );
}

export default AvailableBooks;
