import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center text-center w-full min-h-screen p-8 bg-gray-100">
            <Suspense
                fallback={
                    <p className="text-gray-700 text-md mb-10">Loading user infos...</p>
                }>
                <UserData />
            </Suspense>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            </div>
        </div>
    );
}

async function UserData() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userData = user?.user_metadata;

    return (
        <div className="max-w-4xl w-full">
            <p className="flex items-center justify-center font-mono text-gray-700 text-2xl">
                Hello {userData?.first_name} {userData?.last_name}
            </p>
            <div className="flex items-center justify-between">
                <p className="font-mono text-gray-700">
                    {userData?.email}
                </p>
                <p className="text-gray-600 font-mono">
                    {userData?.email_verified ? "Verified" : "Unverified"}
                </p>
            </div>
        </div>
    );
}
