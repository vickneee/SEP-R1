"use server";

import {createClient} from "@/utils/supabase/server";
import type {BorrowedBook} from "@/types/borrowedBook";

export const getAllBorrowedBooks = async (): Promise<{
    borrowedBooks: BorrowedBook[] | null;
    error: string | null;
}> => {
    try {
        const supabase = await createClient();

        // Verify user is librarian
        const {data: userData, error: userError} = await supabase.auth.getUser();
        if (userError || !userData.user) {
            return {borrowedBooks: null, error: "User not authenticated"};
        }

        const {data: userProfile, error: profileError} = await supabase
            .from("users")
            .select("role")
            .eq("user_id", userData.user.id)
            .single();

        if (profileError || userProfile?.role !== "librarian") {
            return {borrowedBooks: null, error: "Only librarians can view borrowed books"};
        }

        const {data, error} = await supabase.rpc('get_all_borrowed_books');

        if (error) {
            console.error("Error fetching all borrowed books:", error);
            return {borrowedBooks: [], error: error.message};
        }

        return {borrowedBooks: data ?? [], error: null};
    } catch (err) {
        console.error("Exception in getAllBorrowedBooks:", err);
        return {borrowedBooks: null, error: "Failed to fetch borrowed books"};
    }
};
