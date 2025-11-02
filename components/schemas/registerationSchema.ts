import { z } from "zod";

export const getRegisterSchema = (t: (key: string) => string) =>
  z.object({
    first_name: z
      .string()
      .min(1, { message: t("signup_validation_first_name_required") })
      .max(50, { message: t("signup_validation_first_name_max_length") }),
    last_name: z
      .string()
      .min(1, { message: t("signup_validation_last_name_required") })
      .max(50, { message: t("signup_validation_last_name_max_length") }),
    password: z
      .string()
      .min(8, { message: t("signup_validation_password_min_length") })
      .max(100, { message: t("signup_validation_password_max_length") }),
    email: z
      .string()
      .min(1, { message: t("signup_validation_email_required") })
      .email({ message: t("signup_validation_email_invalid") }),
  });
