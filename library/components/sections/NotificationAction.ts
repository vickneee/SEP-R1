"use server";

import { createClient } from "@/utils/supabase/server";

const getDueDateNotification = async () => {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 6);
    const todayISO = today.toISOString(); // 例: "2025-09-18T00:15:00.000Z"
    const fiveDaysLaterISO = fiveDaysLater.toISOString();

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

const getOverdueNotification = async () => {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const { data: reservationData, error: reservationError } = await supabase
      .from("reservations")
      .select("reservation_id, book_id, due_date")
      .eq("user_id", userData.user.id)
      .eq("status", "overdue");

    return {
      error: reservationError ? reservationError.message : null,
      notifications: reservationData,
    };
  }
};

const updateReminderSent = async () => {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
};

export { getOverdueNotification, getDueDateNotification };
