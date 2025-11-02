"use client";

import { checkUserCanReserve, type UserReservationStatus } from "@/app/[locale]/penalties/penaltyActions";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useCallback, useEffect, useState} from "react"; // Importing useEffect and useState
import {useLocaleParams} from "@/hooks/useLocaleParams"; // Importing useLocaleParams

interface OverdueBadgeProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

export default function OverdueBadge({ userId, className = "", compact = false }: OverdueBadgeProps) {
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

  const loadStatus = useCallback(async () => {
    setLoading(true);

    try {
      const result = await checkUserCanReserve(userId);
      if (!result.error && result.status) {
        setReservationStatus(result.status);
      }
    } catch (err) {
      console.error("Error loading overdue status:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (loading || !reservationStatus || reservationStatus.can_reserve) {
    return null;
  }

  const overdueCount = reservationStatus.overdue_book_count;

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        {overdueCount} {t("overdueBook")} {overdueCount !== 1 ? 's' : ''}
      </span>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <span className="font-semibold">{t("restrictedNotice")}</span>
        <span>{overdueCount} {t("overdueBook")} {overdueCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="mt-1 text-xs">
          {t("returnOverdueToContinue")}
      </div>
    </div>
  );
}
