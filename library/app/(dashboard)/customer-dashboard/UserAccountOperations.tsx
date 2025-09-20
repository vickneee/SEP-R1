"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UserAccountOperations() {
  const router = useRouter();

  const handleDelete = async () => {
    const res = await fetch("/api/delete-user", { method: "POST" });
    const { success } = await res.json();

    if (success) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/signup");
    } else {
      console.error("failed to delete");
    }
  };

  return (
    <div className="flex flex gap-20 py-5">
      <button
        onClick={() => handleDelete()}
        className="px-4 py-2 text-xs font-semibold rounded-md transition-colors
                                bg-green-600 hover:bg-blue-700 text-white"
      >
        Update
      </button>
      <button
        onClick={() => handleDelete()}
        className="px-4 py-2 text-xs font-semibold rounded-md transition-colors
                                bg-red-600 hover:bg-blue-700 text-white"
      >
        Delete
      </button>
    </div>
  );
}
