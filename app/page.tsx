"use client"

import React, { useEffect, useState, Suspense } from "react";
import Hero from "@/components/sections/Hero";
import AvailableBooks from "@/components/sections/AvailableBooks";
import About from "@/components/sections/About";
import Footer from "@/components/sections/Footer";

import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database";

type Book = Database['public']['Tables']['books']['Row'];

export default function Home() {
    const [books, setBooks] = useState<Book[]>([]);
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
                <Suspense fallback={<div>Loading...</div>}>
                    <Hero />
                </Suspense>
                <AvailableBooks books={books} error={error} />
                <About />
            </main>
            <Footer />
        </div>
    );
}

// Add test comment
