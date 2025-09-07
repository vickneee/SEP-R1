"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Book {
  title: string;
  author: string;
  image: string;
  category: string;
}

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<Book>({
    title: "",
    author: "",
    image: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title && form.author && form.image && form.category) {
      setLoading(true);
      try {
        // tähän vois laittaa oikeen pathin
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
        setForm({ title: "", author: "", image: "", category: "" });
      } catch (error) {
        alert("Error adding book.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
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
        <Button type="submit" className="bg-orange-500 text-white" disabled={loading}>
          {loading ? "Adding..." : "Add Book"}
        </Button>
      </form>
      <h2 className="text-xl font-semibold mt-8 mb-2">Books List</h2>
      <ul>
        {books.map((book, idx) => (
          <li key={idx} className="flex items-center mb-4">
            <img
              src={book.image}
              alt={book.title}
              className="w-16 h-20 object-cover mr-4 rounded"
            />
            <div>
              <strong>{book.title}</strong> by {book.author} <br />
              <em>Category:</em> {book.category}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}