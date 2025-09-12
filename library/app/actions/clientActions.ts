"use server";

import { createClient } from "@/utils/supabase/server";

// export async function getUserId() {
//     const supabase = createClient();
//     const { data, error } = await supabase.auth.getUser();
//     if (error || !data?.user) {
//         return null;
//     }
//     return data.user.id;
// }

export async function reserveBook(bookId: number, dueDate: string) {
    const supabase = await createClient();
    console.log("Reserve book", bookId);
    console.log("Due date", dueDate);

    // Check if the book exists and has available copies
    const { data: book, error: bookError } = await supabase
        .from("books")
        .select("available_copies")
        .eq("book_id", bookId)
        .single();

    if (bookError) {
        console.error("Book fetch error:", bookError);
        return { success: false, error: bookError };
    }

    // Create a reservation
    // @ts-ignore
    const { data, error: insertError } = await supabase
        .from("reservations")
        .insert([{ book_id: bookId, due_date: dueDate }])
        .select()
        .single();

    if (insertError) {
        console.error("Reservation insert error:", insertError);
        return { success: false, error: insertError };
    }

    return { success: true, data };
}
