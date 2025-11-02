"use client";
import { Suspense, useState } from "react";
import UserReservations from "@/app/[locale]/(dashboard)/customer-dashboard/UserReservations";
import UserAccountOperations from "./UserAccountOperations";
import PenaltyStatus from "@/components/custom/PenaltyStatus";
import { useEffect } from "react";
import initTranslations from "@/app/i18n"; // Importing the translation initializer
import { useParams } from "next/navigation";

interface UserProfile {
  created_at: string;
  email: string;
  first_name: string;
  is_active: boolean;
  last_name: string;
  penalty_count: number;
  role: "customer" | "librarian";
  user_id: string;
}

interface CustomerDashboardClientProps {
  userProfile: UserProfile;
  userEmail: string;
}

export default function CustomerDashboardClient({
  userProfile,
  userEmail,
}: CustomerDashboardClientProps) {
  const params = useParams() as { locale?: string } | null; // Type assertion for params
  const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
  const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function
  // State to trigger penalty status refresh when reservation status changes
  const [penaltyRefreshTrigger, setPenaltyRefreshTrigger] = useState<number>(0);

  // Callback to trigger penalty status refresh when UserReservations status changes
  const handleStatusChange = () => {
    setPenaltyRefreshTrigger((prev) => prev + 1);
  };

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const translations = await initTranslations(locale, [
        "customer_dashboard",
      ]);
      setT(() => translations.t);
    };
    loadTranslations();
  }, [locale]);

  return (
    <div className="flex flex-col items-center text-center w-full min-h-screen p-8">
      {/* User Information Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {t("dashboard_welcome")} {userProfile.first_name}!
        </h2>
        <div className="space-y-2 text-left">
          <p>
            <strong>{t("dashboard_label_email")}</strong> {userEmail}
          </p>
          <p>
            <strong>{t("dashboard_label_name")}</strong>{" "}
            {userProfile.first_name} {userProfile.last_name}
          </p>
          <p>
            <strong>{t("dashboard_label_role")}</strong>{" "}
            <span className="capitalize">{t("dashboard_role")}</span>
          </p>
          <p>
            <strong>{t("dashboard_label_status")}</strong>{" "}
            <span
              className={
                userProfile.is_active ? "text-green-600" : "text-red-600"
              }
            >
              {userProfile.is_active
                ? t("dashboard_status_active_capital")
                : t("dashboard_status_inactive")}
            </span>
          </p>

          {/* Enhanced penalty display with details */}
          <div className="mt-3">
            <PenaltyStatus
              userId={userProfile.user_id}
              showDetails={true}
              refreshTrigger={penaltyRefreshTrigger}
            />
          </div>
        </div>
        <UserAccountOperations />
      </div>

      <h1 className="mt-4 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
        {t("dashboard_my_books")}
      </h1>
      <Suspense
        fallback={
          <p className="text-gray-600">{t("dashboard_loading_reservations")}</p>
        }
      >
        <UserReservations onStatusChange={handleStatusChange} />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10"></div>
    </div>
  );
}
