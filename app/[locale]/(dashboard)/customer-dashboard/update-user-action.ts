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

export async function updateUserAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const locale = (formData.get("locale") as string) || "en";
  const { t } = await initTranslations(locale, ["customer_dashboard"]);
  const schemaUpdateEmail = getUpdateEmailSchema(t);
  const validatedField = schemaUpdateEmail.safeParse({
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedField.success) {
    return {
      data: null,
      zodErrors: validatedField.error.flatten().fieldErrors,
      message: t("dashboard_error_missing_email"),
    };
  }

  const { email } = validatedField.data;

  try {
    const supabase = await createClient();
    const { data: userData, error: userDataError } =
      await supabase.auth.getUser();

    if (!userData?.user?.id || userDataError) {
      return {
        data: null,
        zodErrors: null,
        message: `${t("dashboard_error_no_user_data_short")} ${
          userDataError?.message || t("dashboard_error_unknown")
        }`,
      };
    }

    const { data, error } = await getAdminClient().auth.admin.updateUserById(
      userData.user.id,
      { email }
    );

    if (error) {
      return {
        data: null,
        zodErrors: null,
        message: `${t("dashboard_error_email_update_failed_prefix")} ${
          error.message || t("dashboard_error_unknown")
        }${t("dashboard_error_try_again")}`,
      };
    }

    if (!data?.user) {
      return {
        data: null,
        zodErrors: null,
        message: t("dashboard_error_no_user_data"),
      };
    }

    return {
      data,
      zodErrors: null,
      message: t("dashboard_success_email_updated"),
    };
  } catch (error) {
    return {
      data: null,
      zodErrors: null,
      message: `${t("dashboard_error_email_unexpected")} ${
        error instanceof Error ? error.message : String(error)
      }${t("dashboard_error_try_again")}`,
    };
  }
}
