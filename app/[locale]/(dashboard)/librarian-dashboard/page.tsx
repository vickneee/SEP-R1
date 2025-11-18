import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LibrarianDashboardClient from "./LibrarianDashboardClient";

type LibrarianDashboardProps = {
  readonly params: { readonly locale?: string };
};

export default async function LibrarianDashboard({ params }: LibrarianDashboardProps) {
  const supabase = await createClient();
  const locale = params?.locale ?? "en"; // use route locale

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

  if (userProfile?.role !== 'librarian') {
    redirect("/private");
  }

  return (
    <LibrarianDashboardClient
      userProfile={userProfile}
      userEmail={data?.user?.email ?? ''}
      locale={userProfile?.language ?? locale}
    />
  );
}
