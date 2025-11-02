"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signinAction } from "@/app/[locale]/(auth)/signin/auth-actions";
import { useEffect } from "react";
import initTranslations from "@/app/i18n"; // Importing the translation initializer

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
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

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
  const params = useParams() as { locale?: string } | null; // Type assertion for params
  const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
  const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const translations = await initTranslations(locale, ["Signin"]);
      setT(() => translations.t);
    };
    loadTranslations();
  }, [locale]);

  // @ts-expect-error - useActionState type inference is incorrect
  const [formState, formAction] = useActionState(signinAction, INITIAL_STATE);

  useEffect(() => {
    if (formState.message === t("signin_success_message")) {
      setTimeout(() => {
        // Force full reload so NavBar picks up the session
        window.location.href = "/private";
      }, 1000); // 1000 ms = 1 seconds
      toast.success(t("signin_success_message"));
    } else if (
      formState.message &&
      formState.message !== t("signin_success_message")
    ) {
      toast.error("Signin failed: " + formState.message);
    }
  }, [formState]);

  // console.log(formState, "client");
  return (
    <div className={styles.container}>
      <form action={formAction}>
        {/*Passes the current locale to the server action via formData for proper translation handling*/}
        <input type="hidden" name="locale" value={locale} />
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>{t("signin_title")}</CardTitle>
            <CardDescription className={styles.description}>
              {t("signin_prompt_enter_details")}
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="email">
                {t("signin_label_email")}
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
                {t("signin_label_password")}
              </Label>
              <Input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder={t("signin_label_password")}
              />
              <ZodErrors error={formState?.zodErrors?.password} />
            </div>
          </CardContent>
          <CardFooter className={styles.footer}>
            <button type="submit" className={styles.button}>
              {t("signin_title")}
            </button>
          </CardFooter>
        </Card>
        <div className={styles.prompt}>
          {t("signin_text_no_account")}
          <Link className={styles.link} href="/signup">
            {t("signup_label")}
          </Link>
        </div>
      </form>
    </div>
  );
}
