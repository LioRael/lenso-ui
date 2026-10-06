import type { MetadataRoute } from "next";
import { source, pageUrl } from "@/lib/source";
import { env } from "../../env";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.pages.map((page) => ({
    url: new URL(pageUrl(page), env.siteUrl).href,
    alternates: {
      languages: {
        en: new URL(`/en/docs/${page.slug}`, env.siteUrl).href,
        "zh-CN": new URL(`/cn/docs/${page.slug}`, env.siteUrl).href,
      },
    },
  }));
  return [
    ...pages,
    ...(["en", "cn"] as const).map((locale) => ({
      url: new URL(`/${locale}/theme-builder`, env.siteUrl).href,
      alternates: {
        languages: {
          en: new URL("/en/theme-builder", env.siteUrl).href,
          "zh-CN": new URL("/cn/theme-builder", env.siteUrl).href,
        },
      },
    })),
  ];
}
