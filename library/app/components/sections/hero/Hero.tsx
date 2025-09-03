import Image from 'next/image';
import Link from "next/link";
import Button from "@/app/components/ui/Button";

function Hero() {
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
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-md text-white">
            Discover Your Next
            <br />
            <span className="text-orange-600">Great Read </span>
        </h1>
          <p className="text-white md:text-lg max-w-116 mx-auto mb-6 mt-2 drop-shadow-md">
              Browse thousands of books, reserve your favorites, and manage your reading journey all in one place.
          </p>
          {/* Search Bar */}
          <div className="relative flex sm:flex-row items-center justify-center">
              <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  className="w-full rounded-sm max-w-lg px-6 py-3 text-lg text-gray-800 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-600 transition-colors duration-300"
              />
              <div className="absolute right-10 top-1.5 h-full ml-4 flex-shrink-0 hidden sm:block">
                  <Link href="/" passHref>
                      <Button>Search</Button>
                  </Link>
              </div>
          </div>
      </div>
    </section>
  );
}

export default Hero;
