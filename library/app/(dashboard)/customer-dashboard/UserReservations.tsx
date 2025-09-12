"use client"

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

// import {mockReservations} from "@/app/(dashboard)/customer-dashboard/mockReservations";

export default function UserReservations() {
    // const reservations = mockReservations;
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        fetchReservations();
    }, []);

    async function fetchReservations() {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
            setReservations([]);
            return;
        }
        const { data, error } = await supabase
            .from("reservations")
            .select("reservation_id, reservation_date, due_date, return_date, status, books(title, author)")
            .eq("user_id", user.id)
            .order("reservation_date", { ascending: false });

        if (error) {
            console.error("Error fetching reservations:", error);
            return;
        }

        setReservations(data);
    }

    if (!reservations || reservations.length === 0) {
        return <p className="text-gray-600">You don’t have any borrowed books.</p>;
    }

    return (
        <div className="w-full max-w-4xl mt-8">

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
                                {res.return_date ? new Date(res.return_date).toISOString() : "-"}
                            </td>
                            <td className="px-4 py-2">
                  <span
                      className={`px-2 py-1 rounded text-xs ${
                          res.status === "active"
                              ? "bg-green-100 text-green-700"
                              : res.status === "returned"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                      }`}
                  >
                    {res.status}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
