"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useActionState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ZodErrors } from "@/components/custom/ZodErrors";
import { updateUserAction } from "@/app/[locale]/(dashboard)/customer-dashboard/update-user-action";
import initTranslations from "@/app/i18n"; // Importing the translation initializer
// Initial state for the form
const INITIAL_STATE: FormState = {
  data: null,
  zodErrors: null,
  message: null,
};
// Type definition for form state
type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};
// Component for user account operations (update email / delete account)
export default function UserAccountOperations() {
  const params = useParams() as { locale?: string } | null; // Type assertion for params
  const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
  const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function
  const router = useRouter();
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false); // Toggle for showing update email form
  const [formState, formAction] = useActionState<FormState, FormData>(
    updateUserAction,
    INITIAL_STATE
  );
  // Handle account deletion
  const handleDelete = async () => {
    // Prompt the user for account deletion confirmation using the global confirm dialog.
    const confirmed = globalThis.confirm(t("dashboard_confirm_delete_account"));
    if (!confirmed) return;
    // Call API endpoint to delete user
    const res = await fetch("/api/delete-user", { method: "POST" });
    const { success } = await res.json();

    if (success) {
      // If deletion succeeds, sign out and redirect to signup page
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/signup");
    } else {
      console.error("failed to delete");
    }
  };
  // Toggle visibility of update email form
  const toggleShowForm = () => {
    setShowForm((prev) => !prev);
  };

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const translations = await initTranslations(locale, [
        "customer_dashboard",
      ]);
      setT(() => translations.t);
    };
    loadTranslations();
  }, [locale]);
  // If email update succeeds, refresh page and hide form
  useEffect(() => {
    if (formState.message?.includes("successful")) {
      router.push(pathname);
      setShowForm(false);
    }
  }, [formState.message, pathname, router]);

  return (
    <div>
      {/* Buttons for update email and delete account */}
      <div className="w-full max-w-md flex justify-around py-5">
        <button
          data-testid="update-button"
          onClick={() => toggleShowForm()}
          className="px-4 py-2 text-sm rounded transition-colors
                                bg-green-600 hover:bg-green-700 text-white"
        >
          {t("dashboard_button_update_email")}
        </button>
        <button
          data-testid="delete-button"
          onClick={() => handleDelete()}
          className="px-4 py-2 text-sm rounded transition-colors
                                bg-red-600 hover:bg-red-700 text-white"
        >
          {t("dashboard_button_delete_account")}
        </button>
      </div>
      {/* Update email form (shown only when showForm is true) */}
      {showForm && (
        <form action={formAction}>
          {/*Passes the current locale to the server action via formData for proper translation handling*/}
          <input type="hidden" name="locale" value={locale} />
          <Separator />
          <div className="flex flex-col py-5 space-y-8">
            <label
              className="font-bold text-lg text-gray-700 text-center w-full"
              htmlFor="email"
            >
              {t("dashboard_label_new_email")}
            </label>
            <Input
              className="bg-white text-gray-700 text-lg h-10"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
            />
            {/* Display validation errors for email field */}
            <ZodErrors error={formState?.zodErrors?.email} />
            <button
              type="submit"
              className="text-lg px-6 py-1 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300"
            >
              {t("dashboard_button_submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
