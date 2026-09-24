import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import config from "virtual:lenso-docs-config";

import { docsHref } from "../config";

export const GET: APIRoute = async ({ site }) => {
  const origin = config.site ?? site;
  if (!origin) throw new Error("An Astro site URL is required to generate the docs sitemap");
  const entries = await getCollection("docs", ({ data }) => !data.draft);
  const urls = entries
    .map((entry) => new URL(docsHref(config, entry.id), origin).href)
    .sort()
    .map((url) => `<url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`)
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    },
  );
};
