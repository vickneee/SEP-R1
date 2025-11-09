import {getUserProfile} from "./userProfile-action";
import initTranslations from "@/app/i18n";
import {redirect} from "next/navigation";

type PrivatePageProps = {
    params: { locale: string };
};

export default async function PrivatePage({params}: PrivatePageProps) {
    const routeLocale = params?.locale ?? "en";

    const userProfile = await getUserProfile();
    const locale = userProfile?.language || routeLocale || "en";

    const {t} = await initTranslations(locale, ["private"]);

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

    // Render dashboard inline instead of redirecting
    if (userProfile.role === "librarian") {
        redirect(`/${locale}/librarian-dashboard`);
    } else if (userProfile.role === "customer") {
        redirect(`/${locale}/customer-dashboard`);
    }

    return (

        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">
                {t("private_error_access_denied")}
            </h1>
            <p>{t("private_error_invalid_user_role")}</p>
        </div>
    );
}
