import { getUserProfile } from "./userProfile-action";
import LibrarianDashboard from "@/app/[locale]/(dashboard)/librarian-dashboard/page";
import CustomerDashboard from "@/app/[locale]/(dashboard)/customer-dashboard/page";

export default async function PrivatePage() {
  const userProfile = await getUserProfile();

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>User profile not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Render the appropriate dashboard based on user role */}
      {userProfile.role === "librarian" ? (
        <LibrarianDashboard />
      ) : userProfile.role === "customer" ? (
        <CustomerDashboard />
      ) : (
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Invalid user role.</p>
        </div>
      )}
    </div>
  );
}
