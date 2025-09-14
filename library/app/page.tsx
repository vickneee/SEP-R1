import Footer from "@/components/sections/footer/Footer";
import Hero from "@/components/sections/hero/Hero";
import AvailableBooks from "@/components/sections/available-books/AvailableBooks";
import About from "@/components/sections/about/About";

export default function Home() {
    return (
        <div className="font-sans items-center justify-items-center min-h-screen">
            <main className="w-full">
                <Hero/>
                <AvailableBooks />
                <About />
            </main>
            <Footer/>
        </div>
    );
}
