import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CustomerDashboardClient from "./CustomerDashboardClient";

interface Params {
    locale: string;
}

interface CustomerDashboardProps {
    params: Params;
}

export default async function CustomerDashboard({ params }: CustomerDashboardProps) {
    const resolvedParams = await (params as unknown as Promise<Params>);

    // Use the resolved, synchronous object
    const routeLocale = resolvedParams.locale ?? "en";

    const supabase = await createClient();

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

    // Ensure locale is always a string
    const locale = userProfile?.language ?? routeLocale ?? "en";

    return <CustomerDashboardClient userProfile={userProfile} userEmail={data.user.email || ''} locale={locale} />;
}
