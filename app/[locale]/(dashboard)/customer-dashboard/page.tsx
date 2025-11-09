import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CustomerDashboardClient from "./CustomerDashboardClient";

type CustomerDashboardProps = {
    params: {
        locale: string };
};

export default async function CustomerDashboard({ params }: CustomerDashboardProps) {
    const supabase = await createClient();
    const routeLocale = params.locale ?? "en"; // use route locale

    // Get authenticated user
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

    // Determine effective locale: user preference first, fallback to route
    const locale = userProfile.language || routeLocale;

    return <CustomerDashboardClient userProfile={userProfile} userEmail={data.user.email || ''} locale={locale} />;
}
