"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signinAction } from "@/app/(auth)/signin/auth-actions";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/app/components/ui/card";

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { ZodErrors } from "@/app/components/custom/ZodErrors";

const styles = {
  container: "flex justify-center items-center w-full min-h-[750px]",
  card: "w-112 py-8",
  header: "space-y-4 text-center text-orange-500",
  title: "text-4xl font-bold",
  description: "text-md",
  content: "space-y-2",
  fieldGroup: "space-y-2",
  label: "text-xl text-gray-700",
  footer: "text-2xl flex flex-col",
  button:
    "px-6 px-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300",
  prompt: "mt-4 text-center text-md",
  link: "ml-2 font-extrabold text-orange-500",
};

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export function SigninForm() {
  const [formState, formAction] = useActionState(signinAction, INITIAL_STATE);
  console.log(formState, "client");
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
              <Input
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
                id="password"
                name="password"
                type="password"
                placeholder="password"
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
