import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import { homeMetadata } from "@/lib/home-metadata";
import { isLocale } from "@/lib/source";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "cn" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return homeMetadata(lang);
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <HomePage locale={lang} />;
}
