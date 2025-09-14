"use client";
import Image from "next/image";
// import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

function Hero() {
  // const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const router = useRouter();
  // const handleClick = () => {
  //   router.push(`/books?search=${search}`);
  // };
  return (
    <section className="relative w-full h-[750px] flex items-center justify-center bg-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-unsplash.jpg"
          alt="Bookshelf background"
          width={1200}
          height={600}
          className="w-full h-full object-cover blur-sm opacity-85"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-md text-gray-200">
          Discover Your Next
          <br />
          <span className="text-orange-500">Great Read </span>
        </h1>
        <p className="text-gray-200 md:text-lg max-w-116 mx-auto mb-6 mt-2 drop-shadow-md">
          Browse thousands of books, reserve your favorites, and manage your
          reading journey all in one place.
        </p>
        {/* Search Bar */}
        <div className="relative flex sm:flex-row items-center justify-center">
          <input
            id="search"
            name="search"
            type="text"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full rounded-sm max-w-lg px-6 py-3 text-lg text-gray-800 placeholder-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-colors duration-300"
          />
          <div className="absolute right-10 top-1.5 h-full ml-4 flex-shrink-0 hidden sm:block">
            <button
              // onClick={() => handleClick()}
              className="w-auto px-6 spx-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
