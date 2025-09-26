"use server";
import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { z } from "zod";

const schemaRegister = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address" })
    .email({ message: "Please enter a valid email address" }),
});

type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};

export async function updateUserAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedField = schemaRegister.safeParse({
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedField.success) {
    return {
      data: null,
      zodErrors: validatedField.error.flatten().fieldErrors,
      message: "Missing new email address. Failed to update email",
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
        message: `There is no user data: ${
          userDataError?.message || "Unknown error"
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
        message: `Email update failed: ${
          error.message || "Unknown error"
        }. Please try again.`,
      };
    }

    if (!data?.user) {
      return {
        data: null,
        zodErrors: null,
        message:
          "Email update failed: No user data received. Please try again.",
      };
    }

    return {
      data,
      zodErrors: null,
      message: "Email update successful!",
    };
  } catch (error) {
    return {
      data: null,
      zodErrors: null,
      message:
        "Email update failed due to an unexpected error. Please try again.",
    };
  }
}
