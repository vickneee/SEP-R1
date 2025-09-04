"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be under 100 characters" }),
  email: z
    .string()
    .nonempty({ message: "Please enter your email address" })
    .email({
      message: "Please enter a valid email address",
    }),
});

export async function registerUserAction(prevState: any, formData: FormData) {
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
  const supabase = await createClient();

  console.log('🚀 Starting user registration:', { email, first_name, last_name });

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        first_name, 
        last_name,
        role: 'customer' // Default role for new users
      },
    },
  });
  
  if (authError) {
    console.error('❌ Auth signup error:', authError);
    return { ...prevState, message: authError?.message || "Registration failed" };
  }

  console.log('✅ Auth user created:', authData.user?.id, authData.user?.email);

  // Check if user profile was created in database
  if (authData.user) {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Failed to fetch user profile after creation:', profileError);
        
        // Try to create profile manually if trigger failed
        console.log('🔄 Attempting manual profile creation...');
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            user_id: authData.user.id,
            first_name,
            last_name,
            role: 'customer',
            is_active: true,
            penalty_count: 0
          }]);

        if (insertError) {
          console.error('❌ Manual profile creation failed:', insertError);
        } else {
          console.log('✅ Manual profile creation successful');
        }
      } else {
        console.log('✅ User profile found in database:', userProfile);
      }
    } catch (err) {
      console.error('❌ Error checking user profile:', err);
    }

    // Debug: Check trigger logs and auth user data
    try {
      const { data: debugData, error: debugError } = await supabase
        .rpc('debug_auth_users');
      
      if (debugError) {
        console.error('❌ Debug query failed:', debugError);
      } else {
        console.log('🔍 Debug auth users data:', debugData);
      }

      const { data: triggerLogs, error: logError } = await supabase
        .from('trigger_debug_log')
        .select('*')
        .eq('user_id', authData.user.id);

      if (logError) {
        console.error('❌ Trigger log query failed:', logError);
      } else {
        console.log('🔍 Trigger execution logs:', triggerLogs);
      }
    } catch (debugErr) {
      console.error('❌ Debug queries failed:', debugErr);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}
