import Image from "next/image";
import Link from "next/link";

function About() {
    return (
        <section className="w-full h-[750px] flex items-center justify-center bg-[#643220] text-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full h-80 rounded-sm overflow-hidden shadow-lg">
                        <Image
                            src="/about-unsplash.jpg"
                            width={600}
                            height={400}
                            alt="A stack of books"
                            className="absolute w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                            For Every Reader,
                            <br />
                            <span className="text-orange-500">A Favourite Book!</span>
                        </h2>
                        <p className="mb-6 max-w-lg text-lg text-gray-200">
                            Our library is a place to explore knowledge, read great books, and discover new ideas. Whether you need study materials, want to enjoy stories, or just find a quiet space to read, our library is open for you.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-8">
                            <div className="flex flex-col">
                                <span className="text-3xl sm:text-4xl text-orange-500">50K+</span>
                                <span className="text-sm text-gray-300">Books Available</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl sm:text-4xl text-orange-500">1K+</span>
                                <span className="text-sm text-gray-300">Registered Members</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl sm:text-4xl text-orange-500">24/7</span>
                                <span className="text-sm text-gray-300">Online Access</span>
                            </div>
                        </div>
                        <Link href="/sign-in" passHref>
                        <button className="mt-8 px-6 py-2 rounded-sm border-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-300">
                            Explore More
                        </button>
                        </Link>
                    </div>
                </div>
        </section>
    )
}

export default About;
