"use client";

import { reserveBook } from "@/app/[locale]/books/bookActions";
import {
  checkUserCanReserve,
  type UserReservationStatus,
} from "@/app/[locale]/penalties/penaltyActions";
import BookImage from "@/components/custom/BookImage";
import PenaltyBadge from "@/components/custom/PenaltyBadge";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/types/database";
// Type definition for a book row from the database
type Book = Database["public"]["Tables"]["books"]["Row"];

interface BookPageClientProps {
  readonly book: Book;
}
// Client-side component for displaying book details and handling reservations
export default function BookPageClient({
  book: initialBook,
}: BookPageClientProps) {
  const router = useRouter();
  const params = useParams() as { locale?: string } | null;
  const locale = params?.locale ?? "en";
  // State variables for reservation flow
  const [loading, setLoading] = useState(false); // Tracks reservation request in progress
  const [message, setMessage] = useState(""); // Feedback message for user
  const [isSuccess, setIsSuccess] = useState(false); // Indicates success/failure of reservation
  const [reservationStatus, setReservationStatus] =
    useState<UserReservationStatus | null>(null); // User eligibility status
  const [statusLoading, setStatusLoading] = useState(true); // Tracks loading of eligibility check
  const [translations, setTranslations] = useState<Record<string, string>>({}); // Holds localized strings
  // Load translations dynamically based on locale
  useEffect(() => {
    (async () => {
      try {
        const mod = await import(`@/locales/${locale}/BookPageClient.json`);
        setTranslations(mod && (mod.default ?? mod));
      } catch (error) {
        console.error("Error loading translations:", error);
      }
    })();
  }, [locale]);
  // Redirect to private page after successful reservation with delay
  useEffect(() => {
    if (message && isSuccess) {
      const timer = setTimeout(() => {
        router.push("/private");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, isSuccess, router]);
  // Load reservation eligibility status from server
  const loadReservationStatus = useCallback(async () => {
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
  }, []);
  // Trigger eligibility check on component mount
  useEffect(() => {
    loadReservationStatus();
  }, [loadReservationStatus]);
  // Handle reservation request
  const handleReserve = async () => {
    setLoading(true);
    setMessage("");
    try {
      // If no copies available, show error
      if (!initialBook || initialBook.available_copies === 0) {
        setMessage(translations?.error_no_available_copies || "");
        setIsSuccess(false);
        setLoading(false);
        return;
      }
      // If user is restricted, show reason
      if (reservationStatus && !reservationStatus.can_reserve) {
        setMessage(
          reservationStatus.restriction_reason ||
            translations?.error_reservations_not_allowed ||
            ""
        );
        setIsSuccess(false);
        setLoading(false);
        return;
      }
      // Calculate due date (7 days from now)
      const due_date = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      // Attempt reservation
      const result = await reserveBook(initialBook.book_id, due_date);
      console.log("Book ID", initialBook.book_id);
      console.log("Due date", due_date);
      console.log("Reservation result", result);
      if (result.success) {
        setMessage(translations?.success_reservation || "");
        setIsSuccess(true);
      } else {
        setMessage(
          result.error?.message || translations?.error_reservation_failed || ""
        );
        setIsSuccess(false);
      }
    } catch {
      setMessage(translations?.error_generic || "");
      setIsSuccess(false);
    }
    setLoading(false);
  };
  // Render reservation button based on status and availability
  const getReserveButtonElement = () => {
    if (initialBook.available_copies === 0) {
      return (
        <button className="w-auto px-6 py-2 bg-gray-500 text-white rounded cursor-not-allowed">
          {translations?.status_checked_out}
        </button>
      );
    }

    if (reservationStatus && !reservationStatus.can_reserve) {
      return (
        <button
          className="w-auto px-6 py-2 bg-red-500 text-white rounded cursor-not-allowed"
          disabled
        >
          {translations?.status_cannot_reserve} (
          {translations?.status_pending_penalties})
        </button>
      );
    }

    if (statusLoading) {
      return (
        <button
          className="w-auto px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
          disabled
        >
          {translations?.status_checking_eligibility}
        </button>
      );
    }

    return (
      <button
        className="w-auto px-6 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleReserve}
        disabled={loading}
      >
        {loading
          ? translations?.status_reserving
          : translations?.action_reserve_book}
      </button>
    );
  };
  // Render book details and reservation UI
  return (
    <div className="flex flex-col items-center mx-auto mt-12 mb-16">
      <h1 className=" text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
        {translations?.label_book_information}
      </h1>
      <div className="mt-2 w-[380px] px-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col items-center p-2">
          {/* Display book image or fallback component */}
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
          {/* Book title and metadata */}
          <h2 className="text-center text-xl font-semibold mb-2">
            {initialBook.title}
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            {translations?.label_category} {initialBook.category}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {translations?.label_available_copies}{" "}
            {initialBook.available_copies}
          </p>
          {/* Detailed book information */}
          <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
            <p>
              {translations?.label_author} {initialBook.author}
            </p>
            <p>
              {translations?.label_publication_year}{" "}
              {initialBook.publication_year}
            </p>
            <p>
              {translations?.label_publisher} {initialBook.publisher}
            </p>
            <p>
              {translations?.label_total_copies} {initialBook.total_copies}
            </p>
            <p>
              {translations?.label_available_copies}{" "}
              {initialBook.available_copies}
            </p>
          </div>
          {/* Show penalty badge if user cannot reserve */}
          {reservationStatus && !reservationStatus.can_reserve && (
            <div className="mb-4">
              <PenaltyBadge className="w-full" />
            </div>
          )}
          {/* Reservation button */}
          <div className="py-7 flex justify-center">
            {getReserveButtonElement()}
          </div>
          {/* Feedback message */}
          {message && (
            <p
              className={`mb-6 text-center text-sm ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
