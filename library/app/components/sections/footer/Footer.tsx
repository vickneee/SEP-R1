function Footer() {
    return (
        <footer
            className="grid gap-[24px] flex-wrap items-center justify-center bg-[#552A1B] text-[#E46A07] py-12 w-full rounded-none">
            <div>
                <p className="mb-4 md:mb-0">
                    Books, knowledge, and ideas all in one place. Visit our library to study, read, and grow your
                    mind. </p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <p className="text-sm mr-0 md:mr-4 mb-2 md:mb-0 text-white">© 2025 | LibraryHub</p>
                <p className="text-white text-sm">Made with 🧡</p>
            </div>
        </footer>
    )
}

export default Footer;
