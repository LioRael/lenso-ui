import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeBuilder } from "@/components/theme-builder";
import { isLocale } from "@/lib/source";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "cn" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "cn" ? "主题配置中心" : "Theme builder",
    description:
      lang === "cn"
        ? "配置 Lenso UI 明暗主题，实时预览组件并导出主题。"
        : "Configure Lenso UI light and dark themes, preview live components and export your theme.",
    alternates: {
      canonical: `/${lang}/theme-builder`,
      languages: { en: "/en/theme-builder", "zh-CN": "/cn/theme-builder" },
    },
  };
}

export default async function ThemeBuilderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ThemeBuilder locale={lang} />;
}
