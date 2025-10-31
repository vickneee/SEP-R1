"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import Link from "next/link";

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

interface UserProfile {
    created_at: string;
    email: string;
    first_name: string;
    is_active: boolean;
    last_name: string;
    penalty_count: number;
    role: "customer" | "librarian";
    user_id: string;
}

interface LibrarianDashboardClientProps {
    userProfile: UserProfile;
    userEmail: string;
}

export default function LibrarianDashboardClient({ userProfile, userEmail }: LibrarianDashboardClientProps) {
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
                    console.log("Failed to add book");
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
        <div className="max-w-4xl mx-auto my-8">
            {/* User Information Section */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 w-full max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Librarian Dashboard</h2>
                <div className="space-y-2 text-left">
                    <p><strong>Email:</strong> {userEmail}</p>
                    <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
                    <p><strong>Role:</strong> <span className="capitalize font-semibold text-blue-600">{userProfile.role}</span></p>
                    <p><strong>Status:</strong> <span className={userProfile.is_active ? 'text-green-600' : 'text-red-600'}>{userProfile.is_active ? 'Active' : 'Inactive'}</span></p>
                    <p><strong>Management:</strong> <Link href="/penalties" className=" text-blue-600 hover:text-blue-800 underline">View Overdue Books</Link></p>
                    <p><strong>Management:</strong> <Link href="/extend-return" className="text-blue-600 hover:text-blue-800 underline">View Extend/Return Books</Link></p>
                </div>
            </div>

            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Add a Book</h1>
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
                    <Label className="text-gray-700">Publication Year:</Label>
                    <input
                        name="publication_year"
                        type="number"
                        placeholder="Publication Year"
                        value={form.publication_year}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-600"
                    />
                    <Label className="text-gray-700">Total Copies:</Label>
                    <input
                        name="total_copies"
                        type="number"
                        placeholder="Total Copies"
                        value={form.total_copies}
                        onChange={handleChange}
                        required
                        min={1}
                        className="border rounded px-3 py-2 text-gray-600"
                    />
                    <Label className="text-gray-700">Available Copies:</Label>
                    <input
                        name="available_copies"
                        type="number"
                        placeholder="Available Copies"
                        value={form.available_copies}
                        onChange={handleChange}
                        required
                        min={0}
                        className="border rounded px-3 py-2 text-gray-600"
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
        </div>
    );
}
