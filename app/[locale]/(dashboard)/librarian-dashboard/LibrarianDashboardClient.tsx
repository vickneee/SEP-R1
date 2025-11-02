"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from "next/navigation";
import initTranslations from "@/app/i18n";

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

export default function LibrarianDashboardClient({
  userProfile,
  userEmail,
}: LibrarianDashboardClientProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const [translatorSource, setTranslatorSource] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await initTranslations(locale, ["LibrarianDashboardClient"]);
        if (mounted) setTranslatorSource(res);
      } catch (err) {
        console.error("Failed to initialize translations:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const tr = (key: string, vars?: Record<string, any>) => {
    try {
      if (!translatorSource) return key;

      if (typeof translatorSource === "function") {
        return translatorSource(key, vars);
      }

      if (translatorSource && typeof translatorSource.t === "function") {
        return translatorSource.t(key, vars);
      }

      if (translatorSource.t && typeof translatorSource.t === "object" && key in translatorSource.t) {
        return translatorSource.t[key];
      }

      const ns =
        translatorSource.resources?.[locale]?.LibrarianDashboardClient ??
        translatorSource.resources?.LibrarianDashboardClient;
      if (ns && typeof ns === "object" && key in ns) return ns[key];

      if (typeof translatorSource === "object" && key in translatorSource) return translatorSource[key];

      return key;
    } catch (err) {
      console.error("Translation error:", err);
      return key;
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      form.total_copies !== undefined &&
      form.available_copies !== undefined
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
        alert(tr("error_add_book"));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
      {/* User Information Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {tr("dashboard_title")}
        </h2>
        <div className="space-y-2 text-left">
          <p>
            <strong>{tr("email_label")}:</strong> {userEmail}
          </p>
          <p>
            <strong>{tr("name_label")}</strong>{" "}
            {userProfile.first_name} {userProfile.last_name}
          </p>
          <p>
            <strong>{tr("role_label")}</strong>{" "}
            <span className="capitalize font-semibold text-blue-600">
              {tr("role_librarian")}
            </span>
          </p>
          <p>
            <strong>{tr("status_label")}</strong>{" "}
            <span
              className={userProfile.is_active ? "text-green-600" : "text-red-600"}
            >
              {userProfile.is_active ? tr("status_active") : tr("status_inactive")}
            </span>
          </p>
          <p>
            <strong>{tr("management_section")}:</strong>{" "}
            <Link
              href="/penalties"
              className=" text-blue-600 hover:text-blue-800 underline"
            >
              {tr("view_overdue_books")}
            </Link>
          </p>
          <p>
            <strong>{tr("management_section")}:</strong>{" "}
            <Link
              href="/extend-return"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {tr("view_extend_return_books")}
            </Link>
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">{tr("add_book_button")}</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 bg-white p-6 rounded shadow"
        >
          <input
            name="title"
            placeholder={tr("book_title_label")}
            value={form.title}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="author"
            placeholder={tr("book_author_label")}
            value={form.author}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="image"
            placeholder={tr("book_image_url_label")}
            value={form.image}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="category"
            placeholder={tr("book_category_label")}
            value={form.category}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="isbn"
            placeholder={tr("book_isbn_label")}
            value={form.isbn}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="publisher"
            placeholder={tr("book_publisher_label")}
            value={form.publisher}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <Label className="text-gray-700">{tr("book_publication_year_label")}</Label>
          <input
            name="publication_year"
            type="number"
            placeholder={String(new Date().getFullYear())}
            value={form.publication_year}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-gray-600"
          />
          <Label className="text-gray-700">{tr("book_total_copies_label")}</Label>
          <input
            name="total_copies"
            type="number"
            placeholder={tr("book_total_copies_label")}
            value={form.total_copies}
            onChange={handleChange}
            required
            min={1}
            className="border rounded px-3 py-2 text-gray-600"
          />
          <Label className="text-gray-700">{tr("book_available_copies_label")}</Label>
          <input
            name="available_copies"
            type="number"
            placeholder={tr("book_available_copies_label")}
            value={form.available_copies}
            onChange={handleChange}
            required
            min={0}
            className="border rounded px-3 py-2 text-gray-600"
          />
          <Button
            type="submit"
            className="bg-orange-500 text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : tr("book_add_button")}
          </Button>
        </form>
        <h2 className="text-xl font-semibold mt-8 mb-2">{tr("added_books_section")}</h2>
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
                <em>{tr("book_category_colon_label")}</em> {book.category}
                <br />
                <span>{tr("book_isbn_colon_label")} {book.isbn}</span>
                <br />
                <span>{tr("book_publisher_colon_label")} {book.publisher}</span>
                <br />
                <span>{tr("book_year_colon_label")} {book.publication_year}</span>
                <br />
                <span>
                  {tr("book_copies_colon_label")} {book.available_copies}/{book.total_copies}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
