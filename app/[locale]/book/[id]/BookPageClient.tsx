"use client";

import { reserveBook } from "@/app/[locale]/books/bookActions";
import { checkUserCanReserve, type UserReservationStatus } from "@/app/penalties/penaltyActions";
import BookImage from "@/components/custom/BookImage";
import PenaltyBadge from "@/components/custom/PenaltyBadge";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/types/database";

type Book = Database['public']['Tables']['books']['Row'];

export default function BookPageClient({ book: initialBook }: { book: Book }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [reservationStatus, setReservationStatus] = useState<UserReservationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        if (message && isSuccess) {
            const timer = setTimeout(() => {
                router.push('/private');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [message, isSuccess, router]);

    useEffect(() => {
        loadReservationStatus();
    }, []);

    const loadReservationStatus = async () => {
        setStatusLoading(true);
        try {
            const result = await checkUserCanReserve();
            if (!result.error && result.status) {
                setReservationStatus(result.status);
            }
        } catch (error) {
            console.error("Error checking reservation status:", error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleReserve = async () => {
        setLoading(true);
        setMessage("");
        try {
            if (!initialBook || initialBook.available_copies === 0) {
                setMessage("No available copies to reserve.");
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            // Check for penalty restrictions
            if (reservationStatus && !reservationStatus.can_reserve) {
                setMessage(reservationStatus.restriction_reason || "You cannot make reservations at this time.");
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            const due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const result = await reserveBook(initialBook.book_id, due_date);
            console.log("Book ID", initialBook.book_id);
            console.log("Due date", due_date);
            console.log("Reservation result", result);
            if (result.success) {
                setMessage("Reservation successful!");
                setIsSuccess(true);
            } else {
                setMessage(result.error?.message || "Reservation failed.");
                setIsSuccess(false);
            }
        } catch {
            setMessage("An error occurred.");
            setIsSuccess(false);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center mx-auto mt-12 mb-16">
            <h1 className=" text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                Book Information
            </h1>
            <div className="mt-2 w-[380px] px-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col items-center p-2">
                    {initialBook.image ? (
                        <Image
                            src={initialBook.image}
                            alt={initialBook.title}
                            className="w-40 h-56 mb-6 mt-4 rounded-md"
                            width={160}
                            height={224}
                        />
                    ) : (
                        <BookImage
                            title={initialBook.title}
                            category={initialBook.category}
                        />
                    )}

                    <h2 className="text-center text-xl font-semibold mb-2">{initialBook.title}</h2>
                    <p className="text-sm text-gray-500 mb-1">
                        Category: {initialBook.category}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">ISBN: {initialBook.isbn}</p>

                    <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                        <p>Author: {initialBook.author}</p>
                        <p>Publication year: {initialBook.publication_year}</p>
                        <p>Publisher: {initialBook.publisher}</p>
                        <p>Total copies: {initialBook.total_copies}</p>
                        <p>Available copies: {initialBook.available_copies}</p>
                    </div>

                    {/* Penalty Status Display */}
                    {reservationStatus && !reservationStatus.can_reserve && (
                        <div className="mb-4">
                            <PenaltyBadge className="w-full" />
                        </div>
                    )}

                    <div className="py-7 flex justify-center">
                        {initialBook.available_copies === 0 ? (
                            <button className="w-auto px-6 spx-4 py-2 bg-gray-500 text-white rounded cursor-not-allowed">
                                Checked out
                            </button>
                        ) : reservationStatus && !reservationStatus.can_reserve ? (
                            <button className="w-auto px-6 spx-4 py-2 bg-red-500 text-white rounded cursor-not-allowed" disabled>
                                Cannot Reserve (Pending Penalties)
                            </button>
                        ) : statusLoading ? (
                            <button className="w-auto px-6 spx-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
                                Checking eligibility...
                            </button>
                        ) : (
                            <button
                                className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={handleReserve}
                                disabled={loading}
                            >
                                {loading ? "Reserving..." : "Reserve this Book"}
                            </button>
                        )}
                    </div>
                    {message && <p className={`mb-6 text-center text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>}
                </div>
            </div>
        </div>
    );
}
