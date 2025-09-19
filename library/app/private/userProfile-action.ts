"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const getUserProfile = async () => {
  // Get user profile from our database
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/signin");
  }
  if (data?.user?.id) {
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    return userProfile;
  }
};

export { getUserProfile };
