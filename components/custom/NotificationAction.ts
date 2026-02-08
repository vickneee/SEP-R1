"use server";

import { createClient } from "@/utils/supabase/server";
import initTranslations from "@/app/i18n"; // Import translations
/**
 * Fetch due date notifications for the currently authenticated user.
 * - Retrieves active reservations where reminder has not been sent.
 * - Filters reservations with due dates between today and 12 days later.
 */
const getDueDateNotification = async () => {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  // Only proceed if user is authenticated
  if (userData?.user?.id) {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 12);
    // Convert dates to ISO format for database query
    const todayISO = today.toISOString();
    const fiveDaysLaterISO = threeDaysLater.toISOString();
    // Query reservations table for active reservations with due dates in range
    const { data: reservationData, error: reservationError } = await supabase
      .from("reservations")
      .select("reservation_id, book_id, due_date")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .eq("reminder_sent", false)
      .gte("due_date", todayISO)
      .lte("due_date", fiveDaysLaterISO);
    // Return notifications and any error message
    return {
      error: reservationError ? reservationError.message : null,
      notifications: reservationData,
    };
  }
};
/**
 * Mark a reservation reminder as sent.
 * - Updates the reservation record by setting `reminder_sent` to true.
 * - Returns localized error messages if user is not found.
 */
const markReminderSentAsTrue = async (id: number, locale: string = "en") => {
  const { t } = await initTranslations(locale, ["notification"]);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  // If user is not authenticated, return error
  if (!userData?.user?.id) {
    return {
      error: t("notification_error_user_not_found"),
      reservation: [],
    };
  }
  // Update reservation record to mark reminder as sent
  const { data, error } = await supabase
    .from("reservations")
    .update({ reminder_sent: true })
    .eq("reservation_id", id);
  // Return updated reservation data and any error message
  return { error: error ? error.message : null, reservation: data };
};
// Export functions for use in other parts of the application
export { getDueDateNotification, markReminderSentAsTrue };
