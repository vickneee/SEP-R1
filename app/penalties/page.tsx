"use client";

import { useEffect, useState } from "react";
import { getAllOverdueBooks, markBookReturned, processOverdueBooks } from "./penaltyActions";

type OverdueBook = {
  reservation_id: number;
  user_name: string;
  user_email: string;
  book_title: string;
  book_author: string;
  due_date: string;
  days_overdue: number;
  user_id: string;
};

export default function OverdueBooksPage() {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [processingOverdue, setProcessingOverdue] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOverdueBooks();
  }, []);

  const loadOverdueBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllOverdueBooks();
      if (result.error) {
        setError(result.error);
      } else {
        setOverdueBooks(result.overdueBooks || []);
      }
    } catch (err) {
      console.error("Error loading overdue books:", err);
      setError("Failed to load overdue books");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (reservationId: number) => {
    setActionLoading({ ...actionLoading, [reservationId]: true });
    setFeedback("");
    setError("");

    try {
      const result = await markBookReturned(reservationId);
      if (result.success) {
        setFeedback("Book marked as returned successfully");
        // Remove from local state
        setOverdueBooks(overdueBooks.filter(book => book.reservation_id !== reservationId));
      } else {
        setError(result.error || "Failed to mark book as returned");
      }
    } catch (err) {
      console.error("Error marking book as returned:", err);
      setError("Failed to mark book as returned");
    } finally {
      setActionLoading({ ...actionLoading, [reservationId]: false });
    }
  };

  const handleProcessOverdue = async () => {
    setProcessingOverdue(true);
    setFeedback("");
    setError("");

    try {
      const result = await processOverdueBooks();
      if (result.error) {
        setError(result.error);
      } else {
        setFeedback(`Processed ${result.processed_count} overdue books`);
        // Reload overdue books to show new ones
        await loadOverdueBooks();
      }
    } catch (err) {
      console.error("Error processing overdue books:", err);
      setError("Failed to process overdue books");
    } finally {
      setProcessingOverdue(false);
    }
  };

  const totalOverdueBooks = overdueBooks.length;
  const averageDaysOverdue = totalOverdueBooks > 0
    ? Math.round(overdueBooks.reduce((sum, book) => sum + book.days_overdue, 0) / totalOverdueBooks)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Overdue Book Management</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800">Overdue Books</h3>
            <p className="text-2xl font-bold text-red-600">{totalOverdueBooks}</p>
            <p className="text-sm text-red-600">Books currently overdue</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-800">Average Days Overdue</h3>
            <p className="text-2xl font-bold text-orange-600">{averageDaysOverdue}</p>
            <p className="text-sm text-orange-600">Days past due date</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleProcessOverdue}
              disabled={processingOverdue}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {processingOverdue ? "Processing..." : "Process Overdue Books"}
            </button>
            <button
              onClick={loadOverdueBooks}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

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

      {/* Overdue Books Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading overdue books...</p>
        </div>
      ) : overdueBooks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No overdue books found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Days Overdue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overdueBooks.map((book) => (
                <tr key={book.reservation_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{book.user_name}</div>
                      <div className="text-sm text-gray-500">{book.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{book.book_title}</div>
                      <div className="text-sm text-gray-500">by {book.book_author}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(book.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      book.days_overdue <= 3 ? 'bg-yellow-100 text-yellow-800' :
                      book.days_overdue <= 7 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {book.days_overdue} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleMarkReturned(book.reservation_id)}
                      disabled={actionLoading[book.reservation_id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                    >
                      {actionLoading[book.reservation_id] ? 'Processing...' : 'Mark as Returned'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}