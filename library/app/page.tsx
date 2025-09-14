"use client"

import React, { useEffect, useState } from "react";
import Hero from "@/components/sections/Hero";
import AvailableBooks from "@/components/sections/AvailableBooks";
import About from "@/components/sections/About";
import Footer from "@/components/sections/Footer";

import { createClient } from "@/utils/supabase/client";

export default function Home() {
    const [books, setBooks] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            const { data, error } = await createClient()
                .from("books")
                .select("*")

            if (error) {
                setError(error.message)
            } else {
                setBooks(data)
            }
        }

        fetchBooks()
    }, [])

    return (
        <div className="font-sans items-center justify-items-center min-h-screen">
            <main className="w-full">
                <Hero/>
                <AvailableBooks books={books} error={error} />
                <About />
            </main>
            <Footer/>
        </div>
    );
}
