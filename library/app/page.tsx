import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import AvailableBooks from "@/components/sections/AvailableBooks";
import About from "@/components/sections/About";

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
