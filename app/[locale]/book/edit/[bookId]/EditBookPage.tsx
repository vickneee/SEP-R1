"use client";
import React, {useState, useEffect, useCallback} from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { getBookById, updateBook } from "@/app/[locale]/books/bookActions";
import { Label } from "@/components/ui/label";
import initTranslations from "@/app/i18n";

type TranslatorFn = (key: string, vars?: Record<string, unknown>) => string;

type InitTranslationsResult =
  | TranslatorFn
  | {
      t?: TranslatorFn | Record<string, string>;
      i18n?: { t?: TranslatorFn };
      resources?: Record<string, Record<string, Record<string, string>> | Record<string, string>>;
    }
  | Record<string, string>;

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
    const params = useParams();
    const locale = (params?.locale as string) ?? "en";

    const [translatorSource, setTranslatorSource] = useState<InitTranslationsResult | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res: InitTranslationsResult = await initTranslations(locale, ["EditBookPage"]);
                if (mounted) setTranslatorSource(res);
            } catch (err) {
                console.error("Failed to initialize translations:", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [locale]);

    const tr = useCallback((key: string, vars?: Record<string, unknown>) => {
        try {
            if (!translatorSource) return key;

            if (typeof translatorSource === "function") {
                return translatorSource(key, vars);
            }

            if (
                typeof translatorSource === "object" &&
                translatorSource !== null &&
                "t" in translatorSource &&
                typeof (translatorSource as { t?: unknown }).t === "function"
            ) {
                return (translatorSource as { t?: TranslatorFn }).t!(key, vars);
            }

            if (
                typeof translatorSource === "object" &&
                translatorSource !== null &&
                "t" in translatorSource &&
                typeof (translatorSource as { t?: unknown }).t === "object"
            ) {
                const tObj = (translatorSource as { t?: Record<string, string> }).t!;
                if (tObj && key in tObj) return tObj[key];
            }

            if (
                typeof translatorSource === "object" &&
                translatorSource !== null &&
                "i18n" in translatorSource &&
                (translatorSource as { i18n?: unknown }).i18n &&
                typeof (translatorSource as { i18n?: { t?: unknown } }).i18n!.t === "function"
            ) {
                return (translatorSource as { i18n?: { t?: TranslatorFn } }).i18n!.t!(key, vars);
            }

            if (
                typeof translatorSource === "object" &&
                translatorSource !== null &&
                "resources" in translatorSource &&
                (translatorSource as { resources?: unknown }).resources
            ) {
                const resources = translatorSource as { resources?: Record<string, unknown> };
                const byLocale = (resources.resources as Record<string, unknown> | undefined)?.[locale] as
                    | Record<string, string>
                    | undefined;
                const ns = (byLocale as Record<string, Record<string, string>> | undefined)?.EditBookPage
                    ?? (resources.resources as Record<string, Record<string, string>> | undefined)?.EditBookPage;
                if (ns && typeof ns === "object" && key in ns) {
                    return (ns as Record<string, string>)[key];
                }
            }

            if (typeof translatorSource === "object" && translatorSource !== null && key in translatorSource) {
                return (translatorSource as Record<string, string>)[key];
            }

            return key;
        } catch (err) {
            console.error("Translation error:", err);
            return key;
        }
    }, [translatorSource, locale]);

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
            } catch (err) {
                console.error("Error fetching book:", err);
                alert(tr("error_fetch_book"));
            } finally {
                setFetchingBook(false);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId, tr]);

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
            form.image !== undefined &&
            form.category &&
            form.isbn &&
            form.publisher &&
            form.publication_year !== undefined &&
            form.total_copies !== undefined &&
            form.available_copies !== undefined
        ) {
            setLoading(true);
            try {
                const { error } = await updateBook(Number(bookId), {
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

                if (error) {
                    throw new Error(error);
                }

                alert(tr("book_update_success"));
                router.push("/books");
            } catch (err) {
                console.error("Error updating book:", err);
                alert(tr("error_update_book"));
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
                    <p>{tr("loading_book_data")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8">
            {/* User Information Section */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 w-full max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{tr("dashboard_title")}</h2>
                <div className="space-y-2 text-left">
                    <p><strong>{tr("email_label")}</strong> {userEmail}</p>
                    <p><strong>{tr("name_label")}</strong> {userProfile.first_name} {userProfile.last_name}</p>
                    <p><strong>{tr("role_label")}</strong> <span className="capitalize font-semibold text-blue-600">{userProfile.role}</span></p>
                    <p><strong>{tr("status_label")}</strong> <span className={userProfile.is_active ? 'text-green-600' : 'text-red-600'}>{userProfile.is_active ? tr("status_active") : tr("status_inactive")}</span></p>
                    {userProfile.penalty_count > 0 && (
                        <p><strong>{tr("penalties_label")}</strong> <span className="text-red-600">{userProfile.penalty_count}</span></p>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">{tr("edit_book_title")}</h1>
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
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="author"
                        placeholder={tr("book_author_label")}
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
                        placeholder={tr("book_category_label")}
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="isbn"
                        placeholder={tr("book_isbn_label")}
                        value={form.isbn}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <input
                        name="publisher"
                        placeholder={tr("book_publisher_label")}
                        value={form.publisher}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <Label className="text-gray-700">{tr("book_publication_year_label")}</Label>
                    <input
                        name="publication_year"
                        type="number"
                        placeholder={tr("book_publication_year_label")}
                        value={form.publication_year}
                        onChange={handleChange}
                        required
                        className="border rounded px-3 py-2 text-gray-700"
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
                        className="border rounded px-3 py-2 text-gray-700"
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
                        className="border rounded px-3 py-2 text-gray-700"
                    />
                    <div className="flex gap-3 mt-4">
                        <Button type="submit" className="bg-orange-500 text-white flex-1" disabled={loading}>
                            {loading ? tr("updating_label") : tr("update_book_button")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white flex-1"
                            disabled={loading}
                        >
                            {tr("cancel_button")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
