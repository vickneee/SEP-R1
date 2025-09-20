import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user?.id) {
    return NextResponse.json({ success: false, error: error?.message });
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    userData.user.id
  );
  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message });
  }

  return NextResponse.json({ success: true });
}
