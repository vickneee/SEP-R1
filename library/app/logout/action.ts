"user server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error"); //error page is not created
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/*
 <form action={logoutAction}>
        <button type="submit">
          Signout
        </button>
      </form>
      add this to navbar maybe
*/
