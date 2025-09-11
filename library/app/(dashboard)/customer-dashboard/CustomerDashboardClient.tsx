import { Suspense } from "react";
import UserReservations from "@/app/(dashboard)/customer-dashboard/UserReservations";

export default function CustomerDashboardClient() {
    return (
        <div className="flex flex-col items-center text-center w-full min-h-screen p-8">
            {/*<Suspense*/}
            {/*    fallback={*/}
            {/*        <p className="text-gray-700 text-md mb-10">Loading user infos...</p>*/}
            {/*    }>*/}
            {/*    <UserData />*/}
            {/*</Suspense>*/}
            <h1 className="mt-12 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                My Books </h1>
            <Suspense fallback={<p className="text-gray-600">Loading reservations...</p>}>
                <UserReservations />
            </Suspense>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            </div>
        </div>
    );
}
