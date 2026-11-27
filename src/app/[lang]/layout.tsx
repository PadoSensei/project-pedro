export const instant = false;

import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import type { Locale } from "../../../lib/content/schemas";

const locales: Locale[] = ["en", "pt"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <AppShell lang={lang as Locale}>
      {children}
    </AppShell>
  );
}
