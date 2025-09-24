"use client"

import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";
import { getUserPenalties, type UserPenalty } from "@/app/penalties/penaltyActions";

type ReservationWithBook = {
    reservation_id: number;
    reservation_date: string;
    due_date: string;
    return_date: string | null;
    status: "active" | "returned" | "overdue" | "cancelled";
    books: {
        title: string;
        author: string;
    };
};

export default function UserReservations() {
    const [reservations, setReservations] = useState<ReservationWithBook[]>([]);
    const [penalties, setPenalties] = useState<UserPenalty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReturning, setIsReturning] = useState<Record<number, boolean>>({});
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchReservationsAndPenalties();
    }, []);

    async function fetchReservationsAndPenalties() {
        const supabase = createClient();
        const {data: userData} = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
            setReservations([]);
            setPenalties([]);
            setLoading(false);
            return;
        }

        try {
            // Fetch reservations and penalties in parallel
            const [reservationsResult, penaltiesResult] = await Promise.all([
                supabase
                    .from("reservations")
                    .select("reservation_id, reservation_date, due_date, return_date, status, books(title, author)")
                    .eq("user_id", user.id)
                    .order("reservation_date", {ascending: false}),
                getUserPenalties()
            ]);

            if (reservationsResult.error) {
                console.error("Error fetching reservations:", reservationsResult.error);
            } else {
                setReservations(reservationsResult.data || []);
            }

            if (penaltiesResult.error) {
                console.error("Error fetching penalties:", penaltiesResult.error);
            } else {
                setPenalties(penaltiesResult.penalties || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleReturn = async (reservationId: number) => {
            setIsReturning({...isReturning, [reservationId]: true});
            setFeedback('');

            const supabase = createClient();

            try {
                const returnDate = new Date().toISOString(); // ISO format
                const {error} = await supabase
                    .from("reservations")
                    .update({
                        status: "returned",
                        return_date: returnDate
                    })
                    .eq("reservation_id", reservationId);

                if (error) {
                    console.error("Error updating reservation:", error);
                    setIsReturning({...isReturning, [reservationId]: false});
                    setFeedback("Failed to return book. Please try again.");
                    return;
                }
                const updatedReservations: ReservationWithBook[]  = reservations.map(res =>
                    res.reservation_id === reservationId
                        ? {...res, status: "returned", return_date: returnDate}
                        : res
                );
                setReservations(updatedReservations);
                setFeedback("Book successfully returned");
            } catch
                (err) {
                console.error("Error fetching reservations:", err);
                setFeedback("Failed to return book. Please try again");

            } finally {
                setIsReturning({...isReturning, [reservationId]: false});
                setLoading(false);
            }
        };

    function isOverdue(res: ReservationWithBook): boolean {
        if (res.status !== "active") return false; // Only active ones can be overdue
        const today = new Date();
        const dueDate = new Date(res.due_date);
        return dueDate < today;
    }

    function getPenaltyForReservation(reservationId: number): UserPenalty | null {
        return penalties.find(p => p.reservation_id === reservationId && p.status === 'pending') || null;
    }

    function getOverdueDays(dueDate: string): number {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    if (!reservations || reservations.length === 0) {
        return <p className="text-gray-600">You don’t have any borrowed books.</p>;
    }

    return (
        <div className="w-full max-w-4xl mt-8">
            {loading && <p className="text-gray-600 mt-0">Loading reservations...</p>}
            {feedback && <p className="mb-6 text-sm text-green-600 mt-2">{feedback}</p>}
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Author</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Borrowed</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Returned</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Penalty</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                    {reservations.map((res) => (
                        <tr key={res.reservation_id}>
                            <td className="px-6 py-4 text-left">{res.books.title}</td>
                            <td className="px-6 py-4 text-left">{res.books.author}</td>
                            <td className="px-6 py-4 text-left">{new Date(res.reservation_date).toISOString().slice(0, 10)}</td>
                            <td className="px-6 py-4 text-left">{new Date(res.due_date).toISOString().slice(0, 10)}</td>
                            <td className="px-6 py-4 text-left">
                                {res.return_date ? new Date(res.return_date).toISOString().slice(0, 10) : "-"}
                            </td>
                            <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        res.status === "returned"
                                        ? "bg-blue-100 text-blue-700"
                                        : isOverdue(res)
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                    }`}>
                                        {res.status === "returned" ? "returned" : isOverdue(res) ? "overdue" : "active"}
                                    </span>
                            </td>
                            <td className="px-4 py-2">
                                {(() => {
                                    const penalty = getPenaltyForReservation(res.reservation_id);
                                    if (penalty) {
                                        return (
                                            <div className="text-red-600 font-medium">
                                                <div>${penalty.amount.toFixed(2)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {getOverdueDays(res.due_date)} days overdue
                                                </div>
                                            </div>
                                        );
                                    } else if (isOverdue(res) && res.status === "active") {
                                        return (
                                            <div className="text-orange-600 text-xs">
                                                Penalty pending
                                            </div>
                                        );
                                    }
                                    return <span className="text-gray-400">-</span>;
                                })()}
                            </td>
                            <td className="px-4 py-2 text-center">
                                {res.status === 'active' && (
                                    <button onClick={() => handleReturn(res.reservation_id)}
                                            disabled={isReturning[res.reservation_id]} className="px-4 py-2 text-xs font-semibold rounded-md transition-colors
                                bg-blue-600 hover:bg-blue-700 text-white
                                disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {isReturning[res.reservation_id] ? 'Returning...' : 'Return'}
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
