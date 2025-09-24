"use client";

import { useState, useEffect } from "react";
import { checkUserCanReserve, type UserReservationStatus } from "@/app/penalties/penaltyActions";

interface PenaltyBadgeProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

export default function PenaltyBadge({ userId, className = "", compact = false }: PenaltyBadgeProps) {
  const [reservationStatus, setReservationStatus] = useState<UserReservationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const result = await checkUserCanReserve(userId);
      if (!result.error && result.status) {
        setReservationStatus(result.status);
      }
    } catch (err) {
      console.error("Error loading penalty status:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reservationStatus || reservationStatus.can_reserve) {
    return null;
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        {reservationStatus.pending_penalty_count} penalty{reservationStatus.pending_penalty_count !== 1 ? 'ies' : ''}
      </span>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <span className="font-semibold">⚠️ Restricted:</span>
        <span>{reservationStatus.pending_penalty_count} pending penalty{reservationStatus.pending_penalty_count !== 1 ? 'ies' : ''}</span>
        <span className="font-semibold">(${reservationStatus.pending_penalty_amount.toFixed(2)})</span>
      </div>
    </div>
  );
}