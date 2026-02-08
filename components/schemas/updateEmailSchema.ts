import { z } from "zod";
// Function to generate a schema for updating user email using Zod validation
// Accepts a translation function `t` to provide localized error messages
export const getUpdateEmailSchema = (t: (key: string) => string) =>
  z.object({
    // Email: required field
    // - Must contain at least 1 character
    // - Must be a valid email format (checked by Zod's built-in .email() method)
    email: z
      .string()
      .min(1, { message: t("dashboard_validation_email_required") })
      .email({ message: t("dashboard_validation_email_invalid") }),
  });
