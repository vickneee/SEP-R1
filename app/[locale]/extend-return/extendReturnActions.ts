"use server";

import {createClient} from "@/utils/supabase/server";
import type {BorrowedBook} from "@/types/borrowedBook";
import initTranslations from "@/app/i18n"; // Import translations

export const getAllBorrowedBooks = async (locale: string = 'en'): Promise<{
    borrowedBooks: BorrowedBook[] | null;
    error: string | null;
}> => {

    const { t } = await initTranslations(locale, ['ExtendReturn']);

    try {
        const supabase = await createClient();

        // Verify user is librarian
        const {data: userData, error: userError} = await supabase.auth.getUser();
        if (userError || !userData.user) {
            return {borrowedBooks: null, error:  t('borrowed_error_not_authenticated')};
        }

        const {data: userProfile, error: profileError} = await supabase
            .from("users")
            .select("role")
            .eq("user_id", userData.user.id)
            .single();

        if (profileError || userProfile?.role !== "librarian") {
            return {borrowedBooks: null, error: t('borrowed_error_not_librarian')};
        }

        const {data, error} = await supabase.rpc('get_all_borrowed_books');

        if (error) {
            console.error("Error fetching all borrowed books:", error);
            return {borrowedBooks: [], error: t('borrowed_error_failed_fetch')};
        }

        return {borrowedBooks: data ?? [], error: null};
    } catch (err) {
        console.error("Exception in getAllBorrowedBooks:", err);
        return {borrowedBooks: null, error: t('borrowed_error_failed_fetch')};
    }
};
