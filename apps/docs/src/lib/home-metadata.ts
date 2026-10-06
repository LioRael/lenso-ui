import type { Metadata } from "next";
import type { Locale } from "./source";

export function homeMetadata(locale: Locale): Metadata {
  const cn = locale === "cn";
  const title = cn ? "Lenso UI · React 组件与 StyleX" : "Lenso UI — React components with StyleX";
  const description = cn
    ? "探索 Lenso UI 的 React 组件、原生交互、StyleX 样式和主题配置。"
    : "Explore Lenso UI React components, native interactions, StyleX styling and customizable themes.";
  const canonical = cn ? "/cn" : "/";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: { en: "/", "zh-CN": "/cn", "x-default": "/" } },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: cn ? "zh_CN" : "en_US",
    },
    twitter: { card: "summary", title, description },
  };
}
