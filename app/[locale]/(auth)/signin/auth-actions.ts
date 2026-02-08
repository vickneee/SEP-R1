"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createMockClient } from "@/utils/supabase/mock";
import initTranslations from "@/app/i18n";
import { getSigninSchema } from "@/components/schemas/signinSchema";

// Server action for handling user sign-in
export async function signinAction(
  prevState: { message?: string; zodErrors?: Record<string, string[]> },
  formData: FormData
) {
  // Determine locale from form data (default to English)
  const locale = (formData.get("locale") as string) || "en";
  const { t } = await initTranslations(locale, ["Signin"]);
  // Load validation schema for sign-in form
  const schemaSignin = getSigninSchema(t);

  console.log("signinAction called with:", {
    email: formData.get("email"),
    hasPassword: !!formData.get("password"),
    prevState,
  });
  // Validate form fields using Zod schema
  const validatedFields = schemaSignin.safeParse({
    password: (formData.get("password") ?? "") as string,
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedFields.success) {
    // Convert issues into a fieldErrors object manually
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of validatedFields.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }
    const errorResponse = {
      data: null,
      zodErrors: fieldErrors,
      message: t("signup_error_missing_fields"),
    };
    console.log("Validation failed, returning:", errorResponse);
    return errorResponse;
  }
  // Choose Supabase client: mock client for tests, real client otherwise
  const isTest = process.env.NODE_ENV === "test";
  let supabase;
  if (isTest) {
    supabase = await createMockClient();
  } else {
    supabase = await createClient();
  }

  console.log("Attempting signin with email:", validatedFields.data.email);
  const { error } = await supabase.auth.signInWithPassword(
    validatedFields.data
  );
  // If sign-in fails, return error response
  if (error) {
    const errorResponse = {
      data: null,
      zodErrors: null,
      message: error?.message || t("signin_error_prefix"),
    };
    console.log("Signin failed, returning:", errorResponse);
    return errorResponse;
  }

  console.log("Signin successful, revalidating path");
  if (process.env.NODE_ENV !== "test") {
    revalidatePath("/private", "layout");
  }
  // Return success response with translated message
  const successResponse = {
    data: null,
    zodErrors: null,
    message: t("signin_success_message"),
  };
  console.log("Returning success response:", successResponse);
  return successResponse;
}
