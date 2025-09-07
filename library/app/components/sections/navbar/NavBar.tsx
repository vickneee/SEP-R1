"use client";

import {useQueryState} from "nuqs";
import {usePathname, useRouter} from "next/navigation";
import bookIcon from "../../../../public/bookIcon.png";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import refetchBooks from "./refetchBook";
import useSupabaseSession from "@/hooks/useSupabaseSession";

function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useQueryState("search", {defaultValue: ""});

    const {session, loading, supabase} = useSupabaseSession();

    const handleSearch = (value: string) => {
        if (pathname !== "/books") {
            router.push(`/books?search=${value}`);
        } else {
            setSearch(value);
            setTimeout(() => {
                refetchBooks();
            }, 300);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    }

    return (
        <section className="sticky top-0 z-50 bg-white">
            <nav className="border-b border-gray-200 p-8">
                <div>
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="text-2xl font-bold flex gap-12">
                            {/* Logo Section */}
                            <Link href="/">
                                {/* The book icon */}
                                <img src={bookIcon.src} alt="LibraryHub Logo" className="h-8 w-8"/>
                            </Link>
                            <Link href="/">
                <span className="ml-2 text-2xl font-bold text-orange-500">
                  LibraryHub
                </span>
                            </Link>
                        </div>
                        {/* Search Bar */}
                        <div className="text-2xl flex gap-12">
                            <label htmlFor="search" className="sr-only">
                                Search
                            </label>
                            <div className="relative text-gray-400 focus-within:text-gray-600 w-[300px]">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <MagnifyingGlassIcon className="h-5 w-5"/>
                                </div>
                                <input id="search" name="search"
                                       className="block w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 leading-5 bg-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500 sm:text-sm"
                                       placeholder="Search title, authors, or categories..." type="search"
                                       value={search} onChange={(e) => handleSearch(e.target.value)}/>
                            </div>
                        </div>
                        {/* Links + Auth */}
                        <div className="flex row-auto items-center-safe space-x-12">
                            {/*<Link href="/" className="hover:underline hover:text-orange-500">*/}
                            {/*  Home*/}
                            {/*</Link>*/}
                            {/*<Link*/}
                            {/*  href="/my-books"*/}
                            {/*  className="hover:underline hover:text-orange-500"*/}
                            {/*>*/}
                            {/*  My Books*/}
                            {/*</Link>*/}
                            <Link href="/" className="hover:underline hover:text-orange-500">
                                Languages
                            </Link>

                            <div className="ml-4 flex-shrink-0">
                                {!loading && (
                                    session?.user ? (
                                        <Button onClick={handleLogout}>Log out</Button>
                                    ) : (
                                        <Link href="/signin" passHref>
                                            <Button>Sign In</Button>
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </section>
    );
}

export default NavBar;
