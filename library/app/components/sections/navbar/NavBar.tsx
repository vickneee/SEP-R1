'use client'

import bookIcon from '../../../../public/bookIcon.png';
import SearchIcon from '../../../components/icons/SearchIcon'
import Link from "next/link";
import Button from "@/app/components/ui/Button";

function NavBar() {
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 p-8">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold flex gap-12">
                    {/* Logo Section */}
                    <Link href="/">
                        {/* The book icon */}
                        <img src={bookIcon.src} alt="LibraryHub Logo" className="h-8 w-8"/>
                    </Link>
                    <Link href="/">
                        <span className="ml-2 text-2xl font-bold text-orange-600">LibraryHub</span>
                    </Link>
                </div>
                {/* Search Bar */}
                <div className="text-2xl flex gap-12">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative text-gray-400 focus-within:text-gray-600 w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <SearchIcon className="h-5 w-5" aria-hidden="true"/>
                        </div>
                        <input id="search" name="search"
                               className="block w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-600 sm:text-sm"
                               placeholder="Search book, authors, or subjects..." type="search"/>
                    </div>
                </div>

                <div className="flex row-auto items-center-safe space-x-12">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                    <Link href="/my-books" className="hover:underline">
                        My Books
                    </Link>
                    <Link href="/history" className="hover:underline">
                        History
                    </Link>
                    <div className="ml-4 flex-shrink-0">
                        <Link href="/sign-in" passHref>
                            <Button>Sign In</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
