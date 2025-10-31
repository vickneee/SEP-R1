"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { extendReservation } from "@/app/[locale]/books/extendedAction";
import { useNotification } from "@/context/NotificationContext";

type ReservationWithBook = {
  reservation_id: number;
  reservation_date: string;
  due_date: string;
  return_date: string | null;
  status: "active" | "returned" | "extended" | "overdue" | "cancelled";
  extended: boolean;
  books: {
    title: string;
    author: string;
  };
};

interface UserReservationsProps {
  onStatusChange?: () => void; // Optional callback when book status changes
}

export default function UserReservations({
  onStatusChange,
}: UserReservationsProps = {}) {
  const [reservations, setReservations] = useState<ReservationWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReturning, setIsReturning] = useState<Record<number, boolean>>({});
  const [isExtending] = useState<{ [key: string]: boolean }>({});
  const [extendedReservations, setExtendedReservations] = useState<number[]>(
    []
  );
  const [feedback, setFeedback] = useState("");
  const { triggerRefresh } = useNotification();

  useEffect(() => {
    fetchReservationsAndPenalties();
  }, []);

  async function fetchReservationsAndPenalties() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      console.log("No user found in UserReservations");
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          "reservation_id, reservation_date, due_date, return_date, status, extended, books(title, author)"
        )
        .eq("user_id", user.id)
        .order("reservation_date", { ascending: false });

      if (error) {
        console.error("Error fetching reservations:", error);
      } else {
        console.log(
          "Fetched reservations for user:",
          user.id,
          "Count:",
          data?.length || 0
        );
        setReservations(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleExtend = async (reservationId: number) => {
    if (extendedReservations.includes(reservationId)) {
      return;
    }

    try {
      const updated = (await extendReservation(
        reservationId
      )) as unknown as ReservationWithBook;

      setReservations(
        reservations.map((r) =>
          r.reservation_id === reservationId ? updated : r
        )
      );

      setExtendedReservations([...extendedReservations, reservationId]);

      setFeedback("Book extended successfully!");

      // Notify parent component that status might have changed
      if (onStatusChange) {
        onStatusChange();
      }
      //triger notification component to update
      triggerRefresh();
    } catch (err) {
      console.error(err);
      setFeedback("Could not extend book");
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
        setFeedback("Failed to return book. Please try again.");
        return;
      }
      const updatedReservations: ReservationWithBook[] = reservations.map(
        (res) =>
          res.reservation_id === reservationId
            ? { ...res, status: "returned", return_date: returnDate }
            : res
      );
      setReservations(updatedReservations);
      setFeedback("Book successfully returned");

      // Notify parent component that status might have changed
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      console.error("Error returning book:", err);
      setFeedback("Failed to return book. Please try again");
    } finally {
      setIsReturning({ ...isReturning, [reservationId]: false });
    }
  };

  function isOverdue(res: ReservationWithBook): boolean {
    if (res.status !== "active") return false; // Only active ones can be overdue
    const today = new Date();
    const dueDate = new Date(res.due_date);
    return dueDate < today;
  }

  if (loading) {
    return <p className="text-gray-600">Loading reservations...</p>;
  }

  if (!reservations || reservations.length === 0) {
    return (
      <p className="text-gray-600">You don&apos;t have any borrowed books.</p>
    );
  }

  return (
    <div className="min-w-[1020] max-w-4xl mt-8">
      {feedback && (
        <p className="mb-6 text-sm text-green-600 mt-2">{feedback}</p>
      )}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Author
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Borrowed
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Due
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Returned
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Extend
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Return
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {reservations.map((res) => (
              <tr key={res.reservation_id}>
                <td className="px-6 py-4 text-left">{res.books.title}</td>
                <td className="px-6 py-4 text-left">{res.books.author}</td>
                <td className="px-6 py-4 text-left">
                  {new Date(res.reservation_date).toISOString().slice(0, 10)}
                </td>
                <td className="px-6 py-4 text-left">
                  {new Date(res.due_date).toISOString().slice(0, 10)}
                </td>
                <td className="px-6 py-4 text-left">
                  {res.return_date
                    ? new Date(res.return_date).toISOString().slice(0, 10)
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      res.status === "returned"
                        ? "bg-blue-100 text-blue-700"
                        : isOverdue(res)
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {res.status === "returned"
                      ? "returned"
                      : isOverdue(res)
                      ? "overdue"
                      : "active"}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {res.status === "active" && (
                    <button
                      onClick={() => handleExtend(res.reservation_id)}
                      disabled={isExtending[res.reservation_id] || res.extended}
                      className="px-3 py-1 text-xs rounded transition-colors
                                            bg-green-600 hover:bg-green-700 text-white
                                            disabled:cursor-not-allowed disabled:text-gray-600 disabled:bg-neutral-50"
                    >
                      {isExtending[res.reservation_id]
                        ? "Extending..."
                        : res.extended
                        ? "Extended"
                        : "Extend"}
                    </button>
                  )}
                </td>

                <td className="px-4 py-2 text-center">
                  {res.status === "active" && (
                    <button
                      onClick={() => handleReturn(res.reservation_id)}
                      disabled={isReturning[res.reservation_id]}
                      className="px-4 py-1 text-xs rounded transition-colors
                                bg-blue-600 hover:bg-blue-700 text-white
                                disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isReturning[res.reservation_id]
                        ? "Returning..."
                        : "Return"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
