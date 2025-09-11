import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
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

  if (!userProfile || userProfile.role !== 'librarian') {
    redirect("/private");
  }

  return <AdminDashboardClient userProfile={userProfile} userEmail={data.user.email || ''} />;
}