import Footer from "@/app/components/sections/footer/Footer";

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-4xl px-4 mx-auto">{children}</div>
      </main>
      <footer className="py-25">
        <Footer />
      </footer>
    </div>
  );
}
