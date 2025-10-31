import Image from "next/image";
import Link from "next/link";
import {useParams} from "next/navigation";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useEffect, useState} from "react"; // Importing useEffect and useState

function About() {
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
        <section className="w-full h-[750px] flex items-center justify-center bg-[#643220] text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative w-full h-80 rounded-sm overflow-hidden shadow-lg">
                    <Image src="/about-unsplash.jpg" width={600} height={400} alt="A stack of books"
                           className="absolute w-full h-full object-cover"/>
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                        {/*Adding translation key*/}
                        {t('about_header_1')}
                        <br/>
                        <span className="text-orange-500">
                                {/*Adding translation key*/}
                            {t('about_header_2')}
                                </span>
                    </h2>
                    <p className="mb-6 max-w-lg text-lg text-gray-200">
                        {/*Adding translation key*/}
                        {t('about_p_1')}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-8">
                        <div className="flex flex-col">
                                <span className="text-3xl sm:text-4xl text-orange-500">
                                    {/*Adding translation key*/}
                                    {t('about_span_1')}
                                </span>
                            <span className="text-sm text-gray-300">
                                    {/*Adding translation key*/}
                                {t('about_span_2')}
                                </span>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="text-3xl sm:text-4xl text-orange-500">                              {/*Adding translation key*/}
                                {t('about_span_3')}
                            </span>
                            <span className="text-sm text-gray-300">
                                {/*Adding translation key*/}
                                {t('about_span_4')}
                                </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl sm:text-4xl text-orange-500">
                                {/*Adding translation key*/}
                                {t('about_span_5')}
                            </span>
                            <span className="text-sm text-gray-300">
                                {/*Adding translation key*/}
                                {t('about_span_6')}
                            </span>
                        </div>
                    </div>
                    <Link href="/books" passHref>
                        <button
                            className="mt-8 px-6 py-2 rounded-sm border-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-300">
                            {/*Adding translation key*/}
                            {t('about_btn_explore')}
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default About;
