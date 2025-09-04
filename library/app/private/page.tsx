import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Private Dashboard</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Email:</strong> {data.user.email}</p>
        {userProfile && (
          <>
            <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
            <p><strong>Role:</strong> {userProfile.role}</p>
            <p><strong>Active:</strong> {userProfile.is_active ? 'Yes' : 'No'}</p>
            <p><strong>Penalties:</strong> {userProfile.penalty_count}</p>
          </>
        )}
      </div>
    </div>
  );
}
