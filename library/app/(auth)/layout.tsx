import Footer from "@/app/components/sections/footer/Footer";

export default function AuthLayout({children,}: {
    readonly children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center w-full min-h-[750px]">
            <main className="min-w-2xl">
                <div className="">{children}</div>
            </main>
            <Footer/>
        </div>
    );
}
