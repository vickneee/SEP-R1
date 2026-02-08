import { z } from "zod";
// Function to generate a sign-in schema using Zod validation
// Accepts a translation function `t` to provide localized error messages
export const getSigninSchema = (t: (key: string) => string) =>
  z.object({
    // Password: required, minimum 6 characters, maximum 100 characters
    password: z
      .string()
      .min(6, { message: t("validation_password_min_length") })
      .max(100, { message: t("validation_password_max_length") }),
    // Email: required, must not be empty
    // Note: `.email()` is commented out in favor of a custom regex
    // Regex allows Unicode characters in both local and domain parts
    email: z
      .string()
      .nonempty({ message: t("validation_email_required") })
      // .email({message: t("validation_email_invalid")}),
      // Simple regex to allow Unicode local and domain parts
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u, t("validation_email_invalid")),
  });
