"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signinAction } from "@/app/[locale]/(auth)/signin/auth-actions";
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
import {toast} from "react-hot-toast";

const styles = {
  container: "flex justify-center items-center w-full min-h-[750px]",
  card: "w-112 py-8",
  header: "space-y-4 text-center text-orange-500",
  title: "text-4xl font-bold",
  description: "text-md",
  content: "space-y-2",
  fieldGroup: "space-y-2",
  label: "text-xl text-gray-700",
  input: "text-gray-700 text-xl h-10",
  footer: "text-2xl flex flex-col",
  button:
    "text-lg px-6 py-1 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300",
  prompt: "mt-4 text-center text-md",
  link: "ml-2 font-extrabold text-orange-500",
};

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export function SigninForm() {
  // @ts-expect-error - useActionState type inference is incorrect
  const [formState, formAction] = useActionState(signinAction, INITIAL_STATE);

  useEffect(() => {
    if (formState.message === "Signin successful") {
        setTimeout(() => {
        // Force full reload so NavBar picks up the session
            window.location.href = "/private";
        }, 1000); // 1000 ms = 1 seconds
      toast.success("Signin successful!");
    } else if (formState.message && formState.message !== "Signin successful") {
        toast.error("Signin failed: " + formState.message);
    }
  }, [formState]);

  // console.log(formState, "client");
  return (
    <div className={styles.container}>
      <form action={formAction}>
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Sign In</CardTitle>
            <CardDescription className={styles.description}>
              Enter your details to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="email">
                Email
              </Label>
              <Input className={styles.input}
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
              <Input className={styles.input}
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
              Sign In
            </button>
          </CardFooter>
        </Card>
        <div className={styles.prompt}>
          Don&apos;t have an account?
          <Link className={styles.link} href="/signup">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
