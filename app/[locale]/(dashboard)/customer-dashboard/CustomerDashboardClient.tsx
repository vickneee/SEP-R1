'use client'
import { Suspense, useState } from "react";
import UserReservations from "@/app/[locale]/(dashboard)/customer-dashboard/UserReservations";
import UserAccountOperations from "./UserAccountOperations";
import PenaltyStatus from "@/components/custom/PenaltyStatus";

interface UserProfile {
  created_at: string;
  email: string;
  first_name: string;
  is_active: boolean;
  last_name: string;
  penalty_count: number;
  role: "customer" | "librarian";
  user_id: string;
}

interface CustomerDashboardClientProps {
  userProfile: UserProfile;
  userEmail: string;
}

export default function CustomerDashboardClient({ userProfile, userEmail }: CustomerDashboardClientProps) {
    // State to trigger penalty status refresh when reservation status changes
    const [penaltyRefreshTrigger, setPenaltyRefreshTrigger] = useState<number>(0);

    // Callback to trigger penalty status refresh when UserReservations status changes
    const handleStatusChange = () => {
        setPenaltyRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col items-center text-center w-full min-h-screen p-8">
            {/* User Information Section */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Welcome, {userProfile.first_name}!</h2>
                <div className="space-y-2 text-left">
                    <p><strong>Email:</strong> {userEmail}</p>
                    <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
                    <p><strong>Role:</strong> <span className="capitalize">{userProfile.role}</span></p>
                    <p><strong>Status:</strong> <span className={userProfile.is_active ? 'text-green-600' : 'text-red-600'}>{userProfile.is_active ? 'Active' : 'Inactive'}</span></p>

                    {/* Enhanced penalty display with details */}
                    <div className="mt-3">
                        <PenaltyStatus userId={userProfile.user_id} showDetails={true} refreshTrigger={penaltyRefreshTrigger} />
                    </div>
                </div>
              <UserAccountOperations />
            </div>

            <h1 className="mt-4 text-orange-500 text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex justify-center">
                My Books
            </h1>
            <Suspense fallback={<p className="text-gray-600">Loading reservations...</p>}>
                <UserReservations onStatusChange={handleStatusChange} />
            </Suspense>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10"></div>
    </div>
  );
}
