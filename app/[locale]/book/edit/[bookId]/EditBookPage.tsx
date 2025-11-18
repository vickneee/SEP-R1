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
    readonly userProfile: UserProfile;
    readonly userEmail: string;
    readonly bookId: string;
}

const isTranslatorFunction = (source: unknown): source is TranslatorFn => {
  return typeof source === "function";
};

const tryGetFromTranslatorObject = (source: unknown, key: string, vars?: Record<string, unknown>): string | null => {
  if (typeof source !== "object" || source === null) return null;
  const obj = source as { t?: unknown };
  if ("t" in obj && typeof obj.t === "function") {
    return (obj.t as TranslatorFn)(key, vars);
  }
  return null;
};

const tryGetFromTranslatorRecord = (source: unknown, key: string): string | null => {
  if (typeof source !== "object" || source === null) return null;
  const obj = source as { t?: unknown };
  if ("t" in obj && typeof obj.t === "object" && obj.t !== null) {
    const tObj = obj.t as Record<string, string>;
    return key in tObj ? tObj[key] : null;
  }
  return null;
};

const tryGetFromI18n = (source: unknown, key: string, vars?: Record<string, unknown>): string | null => {
  if (typeof source !== "object" || source === null) return null;
  const obj = source as { i18n?: unknown };
  if ("i18n" in obj && obj.i18n && typeof obj.i18n === "object") {
    const i18nObj = obj.i18n as { t?: unknown };
    if (typeof i18nObj.t === "function") {
      return (i18nObj.t as TranslatorFn)(key, vars);
    }
  }
  return null;
};

const tryGetFromResources = (source: unknown, key: string, locale: string): string | null => {
  if (typeof source !== "object" || source === null) return null;
  const obj = source as { resources?: unknown };
  if ("resources" in obj && obj.resources && typeof obj.resources === "object") {
    const resources = obj.resources as Record<string, unknown>;
    const byLocale = resources[locale];

    let nsCandidate: unknown;

    if (byLocale && typeof byLocale === "object" && "EditBookPage" in (byLocale as Record<string, unknown>)) {
      nsCandidate = (byLocale as Record<string, unknown>)["EditBookPage"];
    } else if ("EditBookPage" in resources) {
      nsCandidate = resources["EditBookPage"];
    }

    if (nsCandidate && typeof nsCandidate === "object") {
      const ns = nsCandidate as Record<string, string>;
      if (key in ns) {
        return ns[key];
      }
    }
  }
  return null;
};

const tryGetFromPlainObject = (source: unknown, key: string): string | null => {
  if (typeof source === "object" && source !== null && key in source) {
    return (source as Record<string, string>)[key];
  }
  return null;
};

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

            if (isTranslatorFunction(translatorSource)) {
                return translatorSource(key, vars);
            }

            const fromTranslatorObj = tryGetFromTranslatorObject(translatorSource, key, vars);
            if (fromTranslatorObj) return fromTranslatorObj;

            const fromTranslatorRecord = tryGetFromTranslatorRecord(translatorSource, key);
            if (fromTranslatorRecord) return fromTranslatorRecord;

            const fromI18n = tryGetFromI18n(translatorSource, key, vars);
            if (fromI18n) return fromI18n;

            const fromResources = tryGetFromResources(translatorSource, key, locale);
            if (fromResources) return fromResources;

            const fromPlainObj = tryGetFromPlainObject(translatorSource, key);
            if (fromPlainObj) return fromPlainObj;

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
