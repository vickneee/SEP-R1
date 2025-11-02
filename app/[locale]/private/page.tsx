import { getUserProfile } from "./userProfile-action";
import LibrarianDashboard from "@/app/[locale]/(dashboard)/librarian-dashboard/page";
import CustomerDashboard from "@/app/[locale]/(dashboard)/customer-dashboard/page";
import initTranslations from "@/app/i18n";

export default async function PrivatePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? "en";
  const { t } = await initTranslations(locale, ["private"]);
  const userProfile = await getUserProfile();

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {t("private_error_generic")}
        </h1>
        <p>{t("private_error_user_not_found")}</p>
      </div>
    );
  }

  return userProfile.role === "librarian" ? (
    <LibrarianDashboard />
  ) : userProfile.role === "customer" ? (
    <CustomerDashboard />
  ) : (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {t("private_error_access_denied")}
      </h1>
      <p>{t("private_error_invalid_user_role")}</p>
    </div>
  );
}
