"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getBookById, updateBook } from "@/app/books/bookActions";
import {Label} from "@/components/ui/label";

interface Book {
    book_id?: number;
    title: string;
    author: string;
    image: string | null;
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

interface EditBookPageProps {
    userProfile: UserProfile;
    userEmail: string;
    bookId: string;
}

export default function EditBookPage({ userProfile, userEmail, bookId }: EditBookPageProps) {
    const router = useRouter();
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
    const [fetchingBook, setFetchingBook] = useState(true);

    // Fetch the existing book data when component mounts
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { book, error } = await getBookById(Number(bookId));
                if (error) {
                    throw new Error(error);
                }
                if (book) {
                    setForm(book);
                }
            } catch (error) {
                console.error("Error fetching book:", error);
                alert("Error fetching book data.");
            } finally {
                setFetchingBook(false);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId]);

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
            form.available_copies !== undefined
        ) {
            setLoading(true);
            try {
                const { book, error } = await updateBook(Number(bookId), {
                    title: form.title,
                    author: form.author,
                    image: form.image,
                    category: form.category,
                    isbn: form.isbn,
                    publisher: form.publisher,
                    publication_year: form.publication_year,
                    total_copies: form.total_copies,
                    available_copies: form.available_copies,
                });

                console.log(book);

                if (error) {
                    throw new Error(error);
                }

                alert("Book updated successfully!");
                router.push("/books");
            } catch (error) {
                console.error("Error updating book:", error);
                alert("Error updating book.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (fetchingBook) {
        return (
            <div className="max-w-4xl mx-auto my-8">
                <div className="text-center">
                    <p>Loading book data...</p>
                </div>
            </div>
        );
    }

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
                    {userProfile.penalty_count > 0 && (
                        <p><strong>Penalties:</strong> <span className="text-red-600">{userProfile.penalty_count}</span></p>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Edit Book</h1>
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
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="author"
                        placeholder="Author"
                        value={form.author}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="image"
                        value={form.image ?? ""}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                        />
                    <input
                        name="category"
                        placeholder="Category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="isbn"
                        placeholder="ISBN"
                        value={form.isbn}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="publisher"
                        placeholder="Publisher"
                        value={form.publisher}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <Label className="text-gray-700">Publication Year:</Label>
                    <input
                        name="publication_year"
                        type="number"
                        placeholder="Publication Year"
                        value={form.publication_year}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
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
                        className="border rounded px-3 py-2 text-gray-700"
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
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <div className="flex gap-3 mt-4">
                        <Button type="submit" className="bg-orange-500 text-white flex-1" disabled={loading}>
                            {loading ? "Updating..." : "Update Book"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
