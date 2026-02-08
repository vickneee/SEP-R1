"use server";
import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import initTranslations from "@/app/i18n"; // Import translations
import { getUpdateEmailSchema } from "@/components/schemas/updateEmailSchema";

type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};
// Server action to update the email address of the currently authenticated user
export async function updateUserAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Determine locale from form data (default to English)
  const locale = (formData.get("locale") as string) || "en";
  const { t } = await initTranslations(locale, ["customer_dashboard"]);
  // Load validation schema for updating email
  const schemaUpdateEmail = getUpdateEmailSchema(t);
  // Validate the email field using Zod schema
  const validatedField = schemaUpdateEmail.safeParse({
    email: (formData.get("email") ?? "") as string,
  });
  // If validation fails, build error response with field-specific messages
  if (!validatedField.success) {
    // Convert issues into a fieldErrors object manually
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of validatedField.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }
    return {
      data: null,
      zodErrors: fieldErrors,
      message: t("dashboard_error_missing_email"),
    };
  }
  // Extract validated email
  const { email } = validatedField.data;

  try {
    // Create Supabase client to get current user
    const supabase = await createClient();
    const { data: userData, error: userDataError } =
      await supabase.auth.getUser();
    // If no user data or error occurred, return failure response
    if (!userData?.user?.id || userDataError) {
      return {
        data: null,
        zodErrors: null,
        message: `${t("dashboard_error_no_user_data_short")} ${
          userDataError?.message || t("dashboard_error_unknown")
        }`,
      };
    }
    // Use admin client to update the user's email by ID
    const { data, error } = await getAdminClient().auth.admin.updateUserById(
      userData.user.id,
      { email }
    );
    // Handle update error
    if (error) {
      return {
        data: null,
        zodErrors: null,
        message: `${t("dashboard_error_email_update_failed_prefix")} ${
          error.message || t("dashboard_error_unknown")
        }${t("dashboard_error_try_again")}`,
      };
    }
    // If no user object is returned, handle as error
    if (!data?.user) {
      return {
        data: null,
        zodErrors: null,
        message: t("dashboard_error_no_user_data"),
      };
    }
    // Successful email update
    return {
      data,
      zodErrors: null,
      message: t("dashboard_success_email_updated"),
    };
  } catch (error) {
    // Handle unexpected errors during update
    return {
      data: null,
      zodErrors: null,
      message: `${t("dashboard_error_email_unexpected")} ${
        error instanceof Error ? error.message : String(error)
      }${t("dashboard_error_try_again")}`,
    };
  }
}
