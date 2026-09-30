import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import DocumentLayout from "@/components/document-layout";
import { isLocale } from "@/lib/source";

export { metadata } from "@/components/document-layout";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <DocumentLayout lang={lang === "cn" ? "zh-CN" : "en"}>{children}</DocumentLayout>;
}
