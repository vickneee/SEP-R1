"use server"

import { createClient } from "@/utils/supabase/server";

export interface ReservationWithBook {
    reservation_id: number;
    user_id: string;
    book_id: number;
    due_date: string;
    status: "active" | "extended" | "returned" |"overdue" | "cancelled";
    extended: boolean;
    books: {
        title: string;
        author: string;
    };
}

export async function extendReservation(reservationId: string | number, locale = "en") {

    const id = typeof reservationId === "string" ? Number(reservationId) : reservationId;

    const supabase = await createClient();

    const { data: reservation, error: fetchError } = await supabase
        .from("reservations")
        .select(`
            *,
            books:book_id (title, author)
        `)
        .eq("reservation_id", id)
        .single();

    if (fetchError || !reservation) throw new Error("Reservation not found");

    const newDueDate = new Date(reservation.due_date);
    newDueDate.setDate(newDueDate.getDate() + 7);

    let messages = { error_extend_reservation: "Failed to extend reservation" };
    try {
        const mod = await import(`../../../locales/${locale}/ExtendedActians.json`);
        messages = (mod && (mod.default ?? mod)) as typeof messages;
    } catch {
    }

    const { data: updated, error: updateError } = await supabase
        .from("reservations")
        .update({ due_date: newDueDate.toISOString(),
        extended: true // Mark as extended
        })
        .eq("reservation_id", id)
        .select(`
            *,
            books:book_id (title, author)
        `)
        .single();

    if (updateError) throw new Error(messages.error_extend_reservation);

    return updated as ReservationWithBook;
}
