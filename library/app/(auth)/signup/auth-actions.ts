"use server";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { z } from "zod";

const schemaRegister = z.object({
  first_name: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be under 50 characters" }),
  last_name: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be under 50 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be under 100 characters" }),
  email: z
    .string()
    .min(1, { message: "Please enter your email address" })
    .email({
      message: "Please enter a valid email address",
    }),
});

type FormState = {
  data: unknown;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
};

export async function registerUserAction(prevState: FormState, formData: FormData) {
  const validatedFields = schemaRegister.safeParse({
    first_name: (formData.get("first_name") ?? "") as string,
    last_name: (formData.get("last_name") ?? "") as string,
    password: (formData.get("password") ?? "") as string,
    email: (formData.get("email") ?? "") as string,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Register",
    };
  }

  const { first_name, last_name, email, password } = validatedFields.data;

  console.log('🚀 Starting user registration:', { email, first_name, last_name });

  try {
    const supabase = await createClient();

    console.log('🔄 Step 1: Creating user with signup and metadata...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role: 'customer',
        },
      },
    });

    if (error) {
      console.error('❌ Signup failed:', error);
      return {
        ...prevState,
        message: `Registration failed: ${error.message || 'Unknown error'}. Please try again.`
      };
    }

    if (data.user && data.user.identities?.length === 0) {
      return {
        ...prevState,
        message: "An account with this email already exists. Please sign in instead."
      };
    }

    if (!data.user) {
      console.error('❌ No user returned from signUp');
      return {
        ...prevState,
        message: "Registration failed: No user data received. Please try again."
      };
    }

    console.log('✅ User created successfully:', data.user.id);

    // Manually create user profile using admin client to bypass RLS
    try {
      const adminSupabase = await createAdminClient();
      const { error: profileError } = await adminSupabase.from("users").upsert({
        user_id: data.user.id,
        email,
        first_name,
        last_name,
        role: 'customer',
      }, { onConflict: 'user_id' });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        return {
          ...prevState,
          message: "Registration failed: Database error updating user. Please try again."
        };
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (profileErr) {
      console.error('❌ Profile creation error:', profileErr);
      return {
        ...prevState,
        message: "Registration failed: Database error updating user. Please try again."
      };
    }

    return {
      ...prevState,
      message: "Registration successful! You can now sign in.",
    };

  } catch (error) {
    console.error('❌ Unexpected error during registration:', error);
    return {
      ...prevState,
      message: "Registration failed due to an unexpected error. Please try again."
    };
  }
}