"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerUserAction } from "@/app/[locale]/(auth)/signup/auth-actions";
import { toast } from "react-hot-toast";
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
import { useParams } from "next/navigation";

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
  const params = useParams() as { locale?: string } | null; // Type assertion for params
  const locale = params?.locale ?? "en"; // Default to 'en' if locale is not provided
  const [t, setT] = useState(() => (key: string) => key); // Initial dummy translation function
  const [formState, formAction] = useActionState(
    registerUserAction,
    INITIAL_STATE
  );
  console.log(formState, "client");

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const translations = await initTranslations(locale, ["signup"]);
      setT(() => translations.t);
    };
    loadTranslations();
  }, [locale]);

  useEffect(() => {
    if (formState.message) {
      toast((t) => {
        t.duration = 8000;
        return (
          <div className="flex flex-col items-center gap-2">
            <span>{formState.message}</span>
          </div>
        );
      });
    }
  }, [formState.message]);

  return (
    <div className={styles.container}>
      <form action={formAction}>
        {/*Passes the current locale to the server action via formData for proper translation handling*/}
        <input type="hidden" name="locale" value={locale} />
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>
              {/*Adding translation key*/}
              {t("signup_title")}
            </CardTitle>
            <CardDescription className={styles.description}>
              {/*Adding translation key*/}
              {t("signup_form_title_create_account")}
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="first_name">
                {/*Adding translation key*/}
                {t("signup_label_first_name")}
              </Label>
              <Input
                className={styles.input}
                id="first_name"
                name="first_name"
                type="text"
                placeholder={t("signup_placeholder_first_name")}
              />
              <ZodErrors error={formState?.zodErrors?.first_name} />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="last_name">
                {/*Adding translation key*/}
                {t("signup_label_last_name")}
              </Label>
              <Input
                className={styles.input}
                id="last_name"
                name="last_name"
                type="text"
                placeholder={t("signup_placeholder_last_name")}
              />
              <ZodErrors error={formState?.zodErrors?.last_name} />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label} htmlFor="email">
                {/*Adding translation key*/}
                {t("signup_label_email")}
              </Label>
                {/* Email must be ASCII for Supabase */}
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
                {/*Adding translation key*/}
                {t("signup_label_password")}
              </Label>
              <Input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder={t("signup_label_password")}
              />
              <ZodErrors error={formState?.zodErrors?.password} />
            </div>
          </CardContent>
          <CardFooter className={styles.footer}>
            <button type="submit" className={styles.button}>
              {/*Adding translation key*/}
              {t("signup_title")}
            </button>
          </CardFooter>
        </Card>
        <div className={styles.prompt}>
          {/*Adding translation key*/}
          {t("signup_text_have_account")}
          <Link className={styles.link} href="/signin">
            {/*Adding translation key*/}
            {t("signup_signin_link")}
          </Link>
        </div>
      </form>
    </div>
  );
}
