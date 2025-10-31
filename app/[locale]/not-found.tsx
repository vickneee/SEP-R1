import Link from "next/link";
import LocalButton from "@/components/ui/localButton";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
            <h1 className="text-4xl font-bold mb-4 text-orange-500">
                Oops! Something went wrong.
            </h1>
            <p className="mb-8 text-lg">
                This page could not be found.
            </p>
            <Link
                href="/" >
                <LocalButton >Go Back Home</LocalButton>
            </Link>
        </div>
    );
}
