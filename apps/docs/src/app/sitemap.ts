import type { MetadataRoute } from "next";
import { source, pageUrl } from "@/lib/source";
import { env } from "../../env";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.pages.map((page) => ({
    url: new URL(pageUrl(page), env.siteUrl).href,
    alternates: {
      languages: {
        en: new URL(`/en/docs/${page.slug}`, env.siteUrl).href,
        "zh-CN": new URL(`/cn/docs/${page.slug}`, env.siteUrl).href,
      },
    },
  }));
}
