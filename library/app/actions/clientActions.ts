"use client";

import { createClient } from "@/utils/supabase/client";

export async function getUserId() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        return null;
    }
    return data.user.id;
}

export async function reserveBook(userId: string, bookId: number, dueDate: string) {
    const supabase = createClient();

    // Create a reservation
    const { data, error: insertError } = await supabase
        .from("reservations")
        .insert([{ user_id: userId, book_id: bookId, due_date: dueDate }])
        .select()
        .single();

    if (insertError) {
        console.error("Reservation insert error:", insertError);
        return { success: false, error: insertError };
    }

    return { success: true, data };
}
