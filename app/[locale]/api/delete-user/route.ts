import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
// Handle POST request for deleting the currently authenticated user
export async function POST() {
  // Create a Supabase client instance (server-side)
  const supabase = await createClient();
  // Retrieve the currently logged-in user
  const { data: userData, error } = await supabase.auth.getUser();
  // If there is an error or no valid user ID, return failure response
  if (error || !userData?.user?.id) {
    return NextResponse.json({ success: false, error: error?.message });
  }
  // Use the admin client to delete the user by ID
  const { error: deleteError } = await getAdminClient().auth.admin.deleteUser(
    userData.user.id
  );
  // If deletion fails, return failure response with error message
  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message });
  }
  // If everything succeeds, return success response
  return NextResponse.json({ success: true });
}
