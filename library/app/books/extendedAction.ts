"use server"

import { createClient } from "@/utils/supabase/server";

class ReservationWithBook {
}

export async function extendReservation(reservationId: string | number) {

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

    if (updateError) throw new Error("Failed to extend reservation");

    return updated as ReservationWithBook;
}
