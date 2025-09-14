"use client";

import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import bookIcon from "../../public/bookIcon.png";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import LocalButton from "@/components/ui/localButton";
import useSupabaseSession from "@/hooks/useSupabaseSession";

function NavBar() {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const { session, loading, supabase } = useSupabaseSession();

  const handleClick = () => {
    router.push(`/books?search=${search}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <section className="sticky top-0 z-50 bg-white">
      <nav className="border-b border-gray-200 p-8">
        <div>
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold flex gap-12">
              {/* Logo Section */}
              <Link href="/">
                {/* The book icon */}
                <img
                  src={bookIcon.src}
                  alt="LibraryHub Logo"
                  className="h-8 w-8"
                />
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
              <div className="relative ml-[40] text-gray-400 focus-within:text-gray-600 w-[310px]">
                {/*<div className="absolute inset-y-0 left-0 pl-3 flex items-center">*/}
                {/*  /!*<MagnifyingGlassIcon className="h-5 w-5" />*!/*/}
                {/*</div>*/}
                <div className="flex items-center">
                  <input
                    id="search"
                    name="search"
                    className="relative block w-full border border-gray-300 rounded-md py-2 pl-4 pr-4 leading-5 bg-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500 text-sm"
                    placeholder="Search title, authors, or categories..."
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-0 px-3 py-2 bg-orange-500 text-white rounded-r-md hover:cursor-pointer hover:bg-orange-500 focus:outline-none"
                    onClick={() => handleClick()}
                  >
                    <MagnifyingGlassIcon className="h-5.5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Links + Auth */}
            <div className="flex row-auto items-center-safe space-x-12">
              {/*<Link href="/" className="hover:underline hover:text-orange-500">*/}
              {/*  Home*/}
              {/*</Link>*/}
              <Link
                href="/private"
                className="hover:underline hover:text-orange-500"
              >
                Private
              </Link>
              <Link href="/" className="hover:underline hover:text-orange-500">
                Languages
              </Link>

              <div className="ml-[-20] flex-shrink-0">
                {!loading &&
                  (session?.user ? (
                    <LocalButton onClick={handleLogout}>Log out</LocalButton>
                  ) : (
                    <Link href="/signin" passHref>
                      <LocalButton>Sign In</LocalButton>
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
