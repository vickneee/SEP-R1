"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Book {
    title: string;
    author: string;
    image: string;
    category: string;
    isbn: string;
    publisher: string;
    publication_year: number;
    total_copies: number;
    available_copies: number;
}

export default function AdminDashboardClient() {
    const [books, setBooks] = useState<Book[]>([]);
    const [form, setForm] = useState<Book>({
        title: "",
        author: "",
        image: "",
        category: "",
        isbn: "",
        publisher: "",
        publication_year: new Date().getFullYear(),
        total_copies: 1,
        available_copies: 1,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                name === "publication_year" ||
                    name === "total_copies" ||
                    name === "available_copies"
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            form.title &&
            form.author &&
            form.image &&
            form.category &&
            form.isbn &&
            form.publisher &&
            form.publication_year &&
            form.total_copies &&
            form.available_copies
        ) {
            setLoading(true);
            try {
                const res = await fetch("/api/books", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });

                if (!res.ok) {
                    throw new Error("Failed to add book");
                }

                const newBook = await res.json();
                setBooks([...books, newBook]);
                setForm({
                    title: "",
                    author: "",
                    image: "",
                    category: "",
                    isbn: "",
                    publisher: "",
                    publication_year: new Date().getFullYear(),
                    total_copies: 1,
                    available_copies: 1,
                });
            } catch (error) {
                console.error("Error adding book:", error);
                alert("Error adding book.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto my-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Add a Book</h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 bg-white p-6 rounded shadow"
            >
                <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="author"
                    placeholder="Author"
                    value={form.author}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="image"
                    placeholder="Image URL"
                    value={form.image}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="isbn"
                    placeholder="ISBN"
                    value={form.isbn}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="publisher"
                    placeholder="Publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="publication_year"
                    type="number"
                    placeholder="Publication Year"
                    value={form.publication_year}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    name="total_copies"
                    type="number"
                    placeholder="Total Copies"
                    value={form.total_copies}
                    onChange={handleChange}
                    required
                    min={1}
                    className="border rounded px-3 py-2"
                />
                <input
                    name="available_copies"
                    type="number"
                    placeholder="Available Copies"
                    value={form.available_copies}
                    onChange={handleChange}
                    required
                    min={0}
                    className="border rounded px-3 py-2"
                />
                <Button type="submit" className="bg-orange-500 text-white" disabled={loading}>
                    {loading ? "Adding..." : "Add Book"}
                </Button>
            </form>
            <h2 className="text-xl font-semibold mt-8 mb-2">Added books</h2>
            <ul>
                {books.map((book, idx) => (
                    <li key={idx} className="flex items-center mb-4">
                        <Image
                            src={book.image}
                            alt={book.title}
                            width={64}
                            height={80}
                            className="object-cover mr-4 rounded"
                        />
                        <div>
                            <strong>{book.title}</strong> by {book.author} <br />
                            <em>Category:</em> {book.category}
                            <br />
                            <span>ISBN: {book.isbn}</span>
                            <br />
                            <span>Publisher: {book.publisher}</span>
                            <br />
                            <span>Year: {book.publication_year}</span>
                            <br />
                            <span>
                                Copies: {book.available_copies}/{book.total_copies}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
