"use client";

import { getAllBorrowedBooks } from "@/app/[locale]/extend-return/extendReturnActions";
import { BorrowedBook } from "@/types/borrowedBook";
import { extendReservation } from "@/app/[locale]/books/extendedAction";
import { createClient } from "@/utils/supabase/client";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import { useCallback, useEffect, useState } from "react"; // Importing useEffect and useState
import { useLocaleParams } from "@/hooks/useLocaleParams"; // Importing useLocaleParams

export default function ExtendReturnBooksPage() {
  const params = useLocaleParams() as { locale?: string } | null; // Type assertion for params
  const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
  const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const translations = await initTranslations(locale, ["ExtendReturn"]);
      setT(() => translations.t);
    };
    loadTranslations();
  }, [locale]);

  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [isReturning, setIsReturning] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<BorrowedBook[]>([]);
  const [extendedReservations, setExtendedReservations] = useState<number[]>(
    []
  );

  const loadBorrowedBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllBorrowedBooks();
      if (result.error) {
        setError(result.error);
      } else {
        setBooks(result.borrowedBooks || []);
      }
    } catch (err) {
      console.error("Error loading overdue books:", err);
      setError(t("borrowed_failed_load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadBorrowedBooks();
  }, [loadBorrowedBooks]);

  // Callback to notify parent component of status changes
  const onStatusChange = () => {
    loadBorrowedBooks();
  };

  const handleExtend = async (reservationId: number) => {
    // Prevent double click
    if (extendedReservations.includes(reservationId)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [reservationId]: true }));

    try {
      const updated = await extendReservation(reservationId);

      if (updated) {
        setExtendedReservations((prev) => [...prev, reservationId]);
        setFeedback(t("borrowed_extend_success"));
        loadBorrowedBooks(); // Refresh the list
      } else {
        setFeedback("Could not extend book");
      }
    } catch (err) {
      console.error(err);
      setFeedback("Could not extend book");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const handleReturn = async (reservationId: number) => {
    setIsReturning({ ...isReturning, [reservationId]: true });
    setFeedback("");

    const supabase = createClient();

    try {
      const returnDate = new Date().toISOString(); // ISO format
      const { error } = await supabase
        .from("reservations")
        .update({
          status: "returned",
          return_date: returnDate,
        })
        .eq("reservation_id", reservationId);

      if (error) {
        console.error("Error updating reservation:", error);
        setIsReturning({ ...isReturning, [reservationId]: false });
        setFeedback(t("borrowed_return_fail"));
        return;
      }
      const updatedReservations: BorrowedBook[] = reservations.map((res) =>
        res.reservation_id === reservationId
          ? { ...res, status: "returned", return_date: returnDate }
          : res
      );
      setReservations(updatedReservations);
      setFeedback(t("borrowed_return_success"));

      // Notify parent component that status might have changed
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      console.error("Error returning book:", err);
      setFeedback(t("borrowed_return_fail"));
    } finally {
      setIsReturning({ ...isReturning, [reservationId]: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {/*Adding translation key*/}
          {t("borrowed_section_title")}
        </h1>

        {/* Feedback Messages */}
        {feedback && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {feedback}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Extend/Return Books Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">{t("borrowed_loading")}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">{t("borrowed_empty")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t("borrowed_col_user")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t("borrowed_col_book")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t("borrowed_col_due_date")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t("borrowed_col_extend")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t("borrowed_col_return")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {books.map((book) => {
                const isExtendAllowed = book.status === "active" || book.status === "overdue";
                const isExtending = Boolean(actionLoading[book.reservation_id]);
                const isExtendDisabled = isExtending || !isExtendAllowed;
                const extendButtonText = isExtending ? t("borrowed_status_extending") : t("borrowed_btn_extend");
                const returnButtonText = actionLoading[book.reservation_id]
                  ? t("borrowed_status_returning")
                  : t("borrowed_btn_return");

                return (
                  <tr key={book.reservation_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {book.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {book.book_title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.book_author}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(book.due_date).toLocaleDateString(locale)}
                    </td>
                    <td className="px-6 py-4">
                      {book.extended ? (
                        <span className="text-sm">{t("borrowed_status_extended")}</span>
                      ) : (
                        isExtendAllowed && (
                          <button
                            onClick={() => handleExtend(book.reservation_id)}
                            disabled={isExtendDisabled}
                            className={`px-3 py-1 rounded text-xs text-white ${
                              isExtendDisabled
                                ? "bg-neutral-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {extendButtonText}
                          </button>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleReturn(book.reservation_id)}
                        disabled={actionLoading[book.reservation_id]}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                      >
                        {returnButtonText}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
