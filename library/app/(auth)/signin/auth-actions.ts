"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const schemaRegister = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be under 100 characters" }),
  email: z
    .string()
    .nonempty({ message: "Please enter your email address" })
    .email({
      message: "Please enter a valid email address",
    }),
});

export async function signinAction(prevState: { message?: string; zodErrors?: Record<string, string[]> }, formData: FormData) {
  const validatedFields = schemaRegister.safeParse({
    password: (formData.get("password") ?? "") as string,
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Register",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(
    validatedFields.data
  );

  if (error) {
    return { ...prevState, message: error?.message || "Signin failed" };
  }

  revalidatePath("/private", "layout");
  redirect("/private");
}
