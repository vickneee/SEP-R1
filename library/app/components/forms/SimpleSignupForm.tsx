"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/(auth)/signup/simple-auth-actions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

type SignupState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

const initialState: SignupState = {
    success: false,
    message: "",
};

export function SimpleSignupForm() {
    const [state, formAction] = useActionState(signupAction, initialState);

    return (
        <div className="w-full max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                        Sign up to get started with our library
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="John"
                                required
                            />
                            {state.errors?.firstName && (
                                <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Doe"
                                required
                            />
                            {state.errors?.lastName && (
                                <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                            />
                            {state.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                            />
                            {state.errors?.password && (
                                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
                            )}
                        </div>

                        <button type="submit" className="w-full px-4 py-2 bg-[#552A1B] rounded-sm text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-300 hover:cursor-pointer">
                            Create Account
                        </button>
                    </form>

                    {state.message && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${state.success
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            {state.message}
                        </div>
                    )}

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
