import { z } from "zod";

export const getUpdateEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("dashboard_validation_email_required") })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
        message: t("dashboard_validation_email_invalid"),
      }),
  });
