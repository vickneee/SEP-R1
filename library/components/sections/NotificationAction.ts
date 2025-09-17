"use server";

import { createClient } from "@/utils/supabase/server";

const getNotification = async () => {
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
      .select("reservation_id, book_id, due_date, status, reminder_sent")
      .eq("user_id", userData.user.id)
      .in("status", ["active", "overdue"] as const)
      .gte("due_date", todayISO)
      .lte("due_date", fiveDaysLaterISO);

    return {
      error: reservationError ? reservationError.message : null,
      notifications: reservationData,
    };
  }
};

export { getNotification };
