"use client";

import { useState, useEffect, useCallback } from "react";
import { checkUserCanReserve, type UserReservationStatus } from "@/app/penalties/penaltyActions";

interface OverdueStatusProps {
  userId?: string;
  showDetails?: boolean;
  className?: string;
}

export default function OverdueStatus({ userId, showDetails = false, className = "" }: OverdueStatusProps) {
  const [reservationStatus, setReservationStatus] = useState<UserReservationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservationStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statusResult = await checkUserCanReserve(userId);

      if (statusResult.error) {
        setError(statusResult.error);
        return;
      }

      setReservationStatus(statusResult.status);
    } catch (err) {
      console.error("Error loading reservation status:", err);
      setError("Failed to load reservation status");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReservationStatus();
  }, [loadReservationStatus]);


  if (loading) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Loading status...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error: {error}
      </div>
    );
  }

  // If user can reserve (no overdue books), show nothing or success message
  if (reservationStatus?.can_reserve) {
    return showDetails ? (
      <div className={`text-green-600 text-sm ${className}`}>
        ✓ No overdue books
      </div>
    ) : null;
  }

  const overdueCount = reservationStatus?.overdue_book_count || 0;

  return (
    <div className={`${className}`}>
      {/* Overdue Summary */}
      <div className="flex items-center gap-2">
        <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm flex items-center gap-1">
          <span className="font-semibold">{overdueCount}</span>
          <span>overdue book{overdueCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Restriction Warning */}
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        ⚠️ {reservationStatus?.restriction_reason}
      </div>
    </div>
  );
}