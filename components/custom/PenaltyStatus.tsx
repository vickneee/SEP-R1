"use client";

import { checkUserCanReserve, type UserReservationStatus } from "@/app/[locale]/penalties/penaltyActions";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useCallback, useEffect, useState} from "react"; // Importing useEffect and useState
import {useLocaleParams} from "@/hooks/useLocaleParams"; // Importing useLocaleParams

interface OverdueStatusProps {
  readonly userId?: string;
  readonly showDetails?: boolean;
  readonly className?: string;
  readonly refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

export default function OverdueStatus({ userId, showDetails = false, className = "", refreshTrigger }: OverdueStatusProps) {
    const params = useLocaleParams() as { locale?: string } | null; // Type assertion for params
    const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
    const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

    // Load translations when locale changes
    useEffect(() => {
        const loadTranslations = async () => {
            const translations = await initTranslations(locale, ["Penalties"]);
            setT(() => translations.t);
        };
        loadTranslations();
    }, [locale]);

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
      setError(t("loadReservationFail"));
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    loadReservationStatus();
  }, [loadReservationStatus]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadReservationStatus();
    }
  }, [refreshTrigger, loadReservationStatus]);


  if (loading) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
          {t("loading_status")}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
          {t("error")}{error}
      </div>
    );
  }

  // If a user can reserve (no overdue books), show nothing or success message
  if (reservationStatus?.can_reserve) {
    return showDetails ? (
      <div className={`text-green-600 text-sm ${className}`}>
          {t("noOverdueBooks")}{error}
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
          <span> {error}{t("processedSuffix_2")} {overdueCount === 1 ? '' : t("s")}</span>
        </div>
      </div>

      {/* Restriction Warning */}
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        ⚠️ {reservationStatus?.restriction_reason}
      </div>
    </div>
  );
}
