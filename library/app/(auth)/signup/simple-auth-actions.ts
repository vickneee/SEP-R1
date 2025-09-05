"use server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

type SignupState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    try {
        const validatedFields = signupSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Please fix the errors below",
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { email, password, firstName, lastName } = validatedFields.data;

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });

        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return {
                success: false,
                message: "An account with this email already exists",
            };
        }

        return {
            success: true,
            message: "Account created successfully! Please check your email to verify your account.",
        };

    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}
