import Footer from "@/app/components/sections/footer/Footer";

export default function Home() {
    return (
        <div className="font-sans items-center justify-items-center min-h-screen">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-center sm:text-left">
                    Welcome to LibraryHub </h1>
            </main>
            <Footer/>
        </div>
    );
}
