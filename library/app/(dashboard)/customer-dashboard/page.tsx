import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CustomerDashboardClient from "./CustomerDashboardClient";

export default async function CustomerDashboard() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/signin");
    }

    // Get user profile from our database
    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

    if (!userProfile || userProfile.role !== 'customer') {
        redirect("/private");
    }

    return <CustomerDashboardClient />;
}
