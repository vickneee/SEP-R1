import { z } from "zod";
// Function to generate a registration schema using Zod validation
// Accepts a translation function `t` to provide localized error messages
export const getRegisterSchema = (t: (key: string) => string) =>
  z.object({
    // First name: required, minimum 1 character, maximum 50 characters
    first_name: z
      .string()
      .min(1, { message: t("signup_validation_first_name_required") })
      .max(50, { message: t("signup_validation_first_name_max_length") }),
    // Last name: required, minimum 1 character, maximum 50 characters
    last_name: z
      .string()
      .min(1, { message: t("signup_validation_last_name_required") })
      .max(50, { message: t("signup_validation_last_name_max_length") }),
    // Password: required, minimum 8 characters, maximum 100 characters
    password: z
      .string()
      .min(8, { message: t("signup_validation_password_min_length") })
      .max(100, { message: t("signup_validation_password_max_length") }),
    // Email: required, must match regex pattern for valid email format
    // Note: `.email()` is commented out in favor of a custom regex
    // Regex allows Unicode characters in local and domain parts
    email: z
      .string()
      .min(1, { message: t("signup_validation_email_required") })
      // .email({ message: t("signup_validation_email_invalid") })
      // Simple regex to allow Unicode local and domain parts

      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
        t("signup_validation_email_invalid")
      ),
  });
