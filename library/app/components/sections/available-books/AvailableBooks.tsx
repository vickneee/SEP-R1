import * as React from "react"

import {Card, CardContent, CardTitle} from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image";
import {books} from "@/data/books";

function AvailableBooks() {
    return (
        <div className="w-full h-[750px] sm:px-8 md:px-16 py-12">
            <h2 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                Available Books
            </h2>
            <div className="flex justify-center mt-10 overflow-hidden">
            <Carousel className="w-full max-w-1/2 sm:max-w-1/2 lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
                <CarouselContent className="-ml-1">
                    {books.map((book, index) => (
                        <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                            <div className="p-4">
                                <Card className="px-4 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-100">
                                    <CardContent className="flex aspect-square items-center justify-center">
                                        <Image src={`/book-covers/book${index + 1}.jpg`} alt={`Book Cover ${book.title}`} width={200} height={250} className="object-cover rounded-md"/>
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
                            className="text-orange-600 hover:shadow-lg transition-shadow duration-300 cursor-pointer"/>
                        <CarouselNext
                            className="text-orange-600 hover:shadow-lg transition-shadow duration-300 cursor-pointer"/>
                    </Carousel>
                </div>
            </div>
    );
}

export default AvailableBooks;
