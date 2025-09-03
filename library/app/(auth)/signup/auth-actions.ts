"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const schemaRegister = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, {
      message: "Username must up to 20 characters",
    }),
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

export async function registerUserAction(prevState: any, formData: FormData) {
  const validatedFields = schemaRegister.safeParse({
    username: (formData.get("username") ?? "") as string,
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

  const { username, email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }, // username will be saved to user_metadata
    },
  });
  if (error) {
    return { ...prevState, message: error?.message || "Registration failed" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
