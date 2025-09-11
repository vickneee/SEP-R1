import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminDashboard from "@/app/(dashboard)/librarian-dashboard/page";
import CustomerDashboard from "@/app/(dashboard)/customer-dashboard/page";

export default async function PrivatePage() {
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

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>User profile not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Render the appropriate dashboard based on user role */}
      {userProfile.role === 'librarian' ? (
        <AdminDashboard />
      ) : userProfile.role === 'customer' ? (
        <CustomerDashboard />
      ) : (
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Invalid user role.</p>
        </div>
      )}
    </div>
  );
}
