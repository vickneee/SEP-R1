"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ZodErrors } from "@/components/custom/ZodErrors";
import { useActionState } from "react";
import { updateUserAction } from "@/app/(dashboard)/customer-dashboard/update-user-action";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const INITIAL_STATE: FormState = {
  data: null,
  zodErrors: null,
  message: null,
};

type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};

export default function UserAccountOperations() {
  const router = useRouter();
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [formState, formAction] = useActionState<FormState, FormData>(
    updateUserAction,
    INITIAL_STATE
  );

  console.log("formState.message:", formState.message);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirmed) return;
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

  const toggleShowForm = () => {
    if (showForm == true) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  useEffect(() => {
    if (formState.message?.includes("successful")) {
      router.push(pathname);
      setShowForm(false);
    }
    toast(formState.message);
  }, [formState.message]);

  return (
    <div>
      <div className="w-full max-w-md flex flex justify-around py-5">
        <button
          onClick={() => toggleShowForm()}
          className="px-4 py-2 text-sm font-semibold rounded-md transition-colors
                                bg-green-600 hover:bg-green-700 text-white"
        >
          Update Email Adress
        </button>
        <button
          onClick={() => handleDelete()}
          className="px-4 py-2 text-sm font-semibold rounded-md transition-colors
                                bg-red-600 hover:bg-red-700 text-white"
        >
          Delete Account
        </button>
      </div>
      {showForm && (
        <form action={formAction}>
          <Separator />
          <div className="flex flex-col py-5 space-y-8">
            <label
              className="font-bold text-lg text-gray-700 text-center w-full"
              htmlFor="email"
            >
              New Email Address
            </label>
            <Input
              className="bg-white text-gray-700 text-lg h-10"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
            />
            <ZodErrors error={formState?.zodErrors?.email} />
            <button
              type="submit"
              className="text-lg px-6 py-1 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
