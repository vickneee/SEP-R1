'use client';
import {useParams} from "next/navigation";
import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useEffect, useState} from "react"; // Importing useEffect and useState

function Footer() {
    const params = useParams() as { locale?: string } | null; // Type assertion for params
    const locale = params?.locale ?? 'en'; // Default to 'en' if locale is not provided
    const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

    // Load translations when locale changes
    useEffect(() => {
        const loadTranslations = async () => {
            const translations = await initTranslations(locale, ['home']);
            setT(() => translations.t);
        };
        loadTranslations();
    }, [locale]);

    return (
        <footer
            className="grid gap-[24px] flex-wrap items-center justify-center bg-[#552A1B] text-[#E46A07] py-12 w-full rounded-none">
            <div>
                <p className="mb-4 md:mb-0">
                    {/*Adding translation key*/}
                    {t('footer_p_1')}
                </p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <p className="text-sm mr-0 md:mr-4 mb-2 md:mb-0 text-gray-200">© {t('footer_p_year')} | {t('footer_p_name')} </p>
                <p className="text-white text-sm">{t('footer_p_2')} 🧡</p>
            </div>
        </footer>
    )
}

export default Footer;
