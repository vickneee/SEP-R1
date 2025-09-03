import Footer from "@/app/components/sections/footer/Footer";
import Hero from "@/app/components/sections/hero/Hero";
import AvailableBooks from "@/app/components/sections/available-books/AvailableBooks";

export default function Home() {
    return (
        <div className="font-sans items-center justify-items-center min-h-screen">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <Hero/>
                <AvailableBooks />
            </main>
            <Footer/>
        </div>
    );
}
