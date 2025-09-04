import Footer from "@/app/components/sections/footer/Footer";
import Hero from "@/app/components/sections/hero/Hero";
import AvailableBooks from "@/app/components/sections/available-books/AvailableBooks";
import About from "@/app/components/sections/about/About";

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
