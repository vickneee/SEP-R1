export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center min-h-screen">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-center sm:text-left">
                Welcome to LibraryHub
            </h1>
      </main>
      <footer className="grid gap-[24px] flex-wrap items-center justify-center bg-[#552A1B] text-[#E46A07] py-12 w-full rounded-none">
          <div>
          <p className="mb-4 md:mb-0">
              Books, knowledge, and ideas all in one place. Visit our library to study, read, and grow your mind.
          </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <p className="text-sm mr-0 md:mr-4 mb-2 md:mb-0 text-white">© 2025 | LibraryHub</p>
              <p className="text-white text-sm">Made with 🧡</p>
          </div>
      </footer>
    </div>
  );
}
