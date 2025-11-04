"use client";

import Image from "next/image";
import {useQueryState} from "nuqs";
import {useRouter} from "next/navigation";
import bookIcon from "../../public/bookIcon.png";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import LocalButton from "@/components/ui/localButton";
import useSupabaseSession from "@/hooks/useSupabaseSession";
import Notification from "@/components/custom/Notification";
import {getUserProfile} from "@/app/[locale]/private/userProfile-action";

import initTranslations from "@/app/i18n"; // Importing the translation initializer
import {useEffect, useState} from "react"; // Importing useEffect and useState
import {useLocaleParams} from '@/hooks/useLocaleParams' ; // Importing useLocaleParams

function NavBar() {
    const params = useLocaleParams() as { locale?: string } | null; // Type assertion for params
    const locale = params?.locale ?? 'en'; // Default to 'en' if locale is not provided
    const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

    // Load translations when locale changes
    useEffect(() => {
        const loadTranslations = async () => {
            const translations = await initTranslations(locale, ['NavBar']);
            setT(() => translations.t);
        };
        loadTranslations();
    }, [locale]);

    const router = useRouter();
    const [search, setSearch] = useQueryState("search", {defaultValue: ""});

    const {session, loading, supabase} = useSupabaseSession();
    const [userRole, setUserRole] = useState<string | null>(null);

    const handleClick = () => {
        router.push(`/books?search=${search}`);
    };

    const handleLogout = async () => {
        try {
            // Sign out globally (all sessions)
            const {error} = await supabase.auth.signOut({scope: 'global'});
            if (error) {
                console.error('Error signing out:', error);
                return;
            }

            // Clear any cached user role state
            setUserRole(null);

            // Use window.location for a complete page reload to ensure all state/cookies are cleared
            window.location.href = "/";
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    const fetchUserProfile = async () => {
        const userProfile = await getUserProfile();
        if (userProfile) {
            setUserRole(userProfile.role);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <section className="sticky top-0 z-50 bg-white">
            <nav className="border-b border-gray-200 p-8">
                <div>
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="text-2xl font-bold flex gap-12">
                            {/* Logo Section */}
                            <Link href="/">
                                {/* The book icon */}
                                <Image src={bookIcon} alt="LibraryHub Logo" width={32} height={32} className="h-8 w-8"/>
                            </Link>
                            <Link href="/">
                <span className="ml-2 text-2xl font-bold text-orange-500">
                    {/*Adding translation key*/}
                    {t('nav_name')}
                </span>
                            </Link>
                        </div>
                        {/* Search Bar */}
                        <div className="text-2xl flex gap-12">
                            <label htmlFor="search" className="sr-only">
                                {/*Adding translation key*/}
                                {t('nav_search_label')}
                            </label>
                            <div className="relative ml-[40] text-gray-400 focus-within:text-gray-600 w-[310px]">
                                {/*<div className="absolute inset-y-0 left-0 pl-3 flex items-center">*/}
                                {/*  /!*<MagnifyingGlassIcon className="h-5 w-5" />*!/*/}
                                {/*</div>*/}
                                <div className="flex items-center">
                                    <input id="search" name="search"
                                           className="relative block w-full border border-gray-300 rounded-md py-2 pl-4 pr-4 leading-5 bg-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500 text-xs"
                                           placeholder={t('nav_search_placeholder')} type="text"
                                           value={search} onChange={(e) => setSearch(e.target.value)}/>
                                    <button type="button"
                                            className="absolute right-0 px-3 py-2 bg-orange-500 text-white rounded-r-md hover:cursor-pointer hover:bg-orange-500 focus:outline-none"
                                            onClick={() => handleClick()}>
                                        <MagnifyingGlassIcon className="h-5.5 w-5"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Links + Auth */}
                        <div className="flex row-auto items-center-safe space-x-12">
                            {/*<Link href="/" className="hover:underline hover:text-orange-500">*/}
                            {/*  Home*/}
                            {/*</Link>*/}
                            <Link href="/private" className="hover:underline hover:text-orange-500">
                                {/*Adding translation key*/}
                                {t('nav_link_private')}
                            </Link>

                            <div className="ml-[-20] flex-shrink-0">
                                {!loading &&
                                    (session?.user ? (
                                        <div className="flex item-center gap-4">
                                            <LocalButton onClick={handleLogout}>
                                                {/*Adding translation key*/}
                                                {t('nav_btn_log_out')}</LocalButton>
                                            {userRole && userRole == "customer" && <Notification/>}
                                        </div>
                                    ) : (
                                        <Link href="/signin" passHref>
                                            <LocalButton>
                                                {/*Adding translation key*/}
                                                {t('nav_btn_sign_in')}</LocalButton>
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </section>
    );
}

export default NavBar;
