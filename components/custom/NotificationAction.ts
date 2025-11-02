"use server";

import { createClient } from "@/utils/supabase/server";
import initTranslations from "@/app/i18n"; // Import translations

const getDueDateNotification = async () => {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 12);
    const todayISO = today.toISOString();
    const fiveDaysLaterISO = threeDaysLater.toISOString();

    const { data: reservationData, error: reservationError } = await supabase
      .from("reservations")
      .select("reservation_id, book_id, due_date")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .eq("reminder_sent", false)
      .gte("due_date", todayISO)
      .lte("due_date", fiveDaysLaterISO);

    return {
      error: reservationError ? reservationError.message : null,
      notifications: reservationData,
    };
  }
};

const markReminderSentAsTrue = async (id: number, locale: string = "en") => {
  const { t } = await initTranslations(locale, ["notification"]);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    return {
      error: t("notification_error_user_not_found"),
      reservation: [],
    };
  }

  const { data, error } = await supabase
    .from("reservations")
    .update({ reminder_sent: true })
    .eq("reservation_id", id);

  return { error: error ? error.message : null, reservation: data };
};

export { getDueDateNotification, markReminderSentAsTrue };
