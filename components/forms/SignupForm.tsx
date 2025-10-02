"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUserAction } from "@/app/(auth)/signup/auth-actions";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ZodErrors } from "@/components/custom/ZodErrors";

const styles = {
  container: "flex justify-center items-center w-full max-w-4xl min-h-[850px]",
  card: "w-112 py-8",
  header: "space-y-2",
  title: "text-4xl font-bold text-center text-orange-500",
  description: "text-md text-center",
  content: "space-y-2",
  fieldGroup: "space-y-2",
  label: "text-xl text-gray-700",
  input: "text-gray-700 text-xl h-10",
  footer: "text-2xl flex flex-col",
  button:
    "px-6 py-1 text-lg bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300",
  prompt: "mt-4 text-center text-md",
  link: "ml-2 font-extrabold text-orange-500",
};

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

export function SignupForm() {
  const [formState, formAction] = useActionState(
    registerUserAction,
    INITIAL_STATE
  );
  console.log(formState, "client");

  useEffect(() => {
    if (formState.message) {
      toast((t) => {
        t.duration = 8000;
        return (
          <div className="flex flex-col items-center gap-2">
            <span>{formState.message}</span>
            {formState.message ==
            "Registration successful! You can now sign in." ? (
              <Link href="/signin" className={styles.button}>
                Sign In
              </Link>
            ) : null}
          </div>
        );
      });
    }
  }, [formState.message]);

  return (
    <div className={styles.container}>
      <form action={formAction}>
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Sign Up</CardTitle>
            <CardDescription className={styles.description}>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="first_name">
                First Name
              </Label>
              <Input
                className={styles.input}
                id="first_name"
                name="first_name"
                type="text"
                placeholder="John"
              />
              <ZodErrors error={formState?.zodErrors?.first_name} />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="last_name">
                Last Name
              </Label>
              <Input
                className={styles.input}
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Doe"
              />
              <ZodErrors error={formState?.zodErrors?.last_name} />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="email">
                Email
              </Label>
              <Input
                className={styles.input}
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
              />
              <ZodErrors error={formState?.zodErrors?.email} />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="password">
                Password
              </Label>
              <Input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder="Password"
              />
              <ZodErrors error={formState?.zodErrors?.password} />
            </div>
          </CardContent>
          <CardFooter className={styles.footer}>
            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </CardFooter>
        </Card>
        <div className={styles.prompt}>
          Have an account?
          <Link className={styles.link} href="/signin">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
