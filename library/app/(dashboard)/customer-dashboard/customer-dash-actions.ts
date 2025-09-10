"use server"

import {createClient} from "@/utils/supabase/server";

export async function getUserDataAction() {
    const supabase = await createClient();
    const {
        data: {user},
    } = await supabase.auth.getUser();

    return user?.user_metadata;
}

export async function getBooksDataAction() {
    const supabase = await createClient();
    const {
        data: books, error
    } = await supabase
        .from("books")
        .select("title, image, author, category, total_copies, available_copies")

    if (error) {
        console.error("Error fetching books:", error);
    }

    if (!books || books.length === 0) {
        console.log("No books found.");
    }

    return books;
}
