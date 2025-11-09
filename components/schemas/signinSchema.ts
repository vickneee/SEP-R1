import {z} from "zod";

export const getSigninSchema = (t: (key: string) => string) =>
  z.object({
    password: z
      .string()
      .min(6, { message: t("validation_password_min_length") })
      .max(100, { message: t("validation_password_max_length") }),
    email: z
      .string()
      .nonempty({ message: t("validation_email_required") })
      // .email({message: t("validation_email_invalid")}),
        // Simple regex to allow Unicode local and domain parts
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
            t("signin_validation_email_invalid")
        ),
  });
