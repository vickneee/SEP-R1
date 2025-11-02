"use server";
import { createClient } from "@/utils/supabase/server";
import { createMockClient } from "@/utils/supabase/mock";
import initTranslations from "@/app/i18n";
import { getRegisterSchema } from "@/components/schemas/registerationSchema";

type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};

export async function registerUserAction(
  prevState: FormState,
  formData: FormData
) {
  console.log("📦 locale from formData:", formData.get("locale"));
  const locale = formData.get("locale")?.toString() || "en";
  const { t } = await initTranslations(locale, ["signup"]);
  const schemaRegister = getRegisterSchema(t);

  const validatedFields = schemaRegister.safeParse({
    first_name: (formData.get("first_name") ?? "") as string,
    last_name: (formData.get("last_name") ?? "") as string,
    password: (formData.get("password") ?? "") as string,
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: t("signup_error_missing_fields"),
    };
  }

  const { first_name, last_name, email, password } = validatedFields.data;

  console.log("🚀 Starting user registration:", {
    email,
    first_name,
    last_name,
  });

  try {
    const isTest = process.env.NODE_ENV === "test";
    let supabase;
    if (isTest) {
      supabase = await createMockClient();
    } else {
      supabase = await createClient();
    }

    console.log("🔄 Step 1: Creating user with signup and metadata...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role: "customer",
        },
      },
    });

    if (error) {
      console.error("❌ Signup failed:", error);
      return {
        ...prevState,
        message: `${t("signup_error_generic_prefix")} ${
          error.message || "Unknown error"
        }${t("signup_error_generic_suffix")}`,
      };
    }

    if (data.user && data.user.identities?.length === 0) {
      return {
        ...prevState,
        message: t("signup_error_email_exists"),
      };
    }

    if (!data.user) {
      console.error("❌ No user returned from signUp");
      return {
        ...prevState,
        message: t("signup_error_no_user_data"),
      };
    }

    console.log("✅ User created successfully:", data.user.id);

    return {
      ...prevState,
      message: t("signup_msg_registration_success"),
    };
  } catch (error) {
    console.error("❌ Unexpected error during registration:", error);
    return {
      ...prevState,
      message: t("signup_error_unexpected"),
    };
  }
}
