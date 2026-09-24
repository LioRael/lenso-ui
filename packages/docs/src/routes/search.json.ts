import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import config from "virtual:lenso-docs-config";

import { docsHref } from "../config";

export const GET: APIRoute = async () => {
  const entries = await getCollection("docs", ({ data }) => !data.draft);
  const documents = entries.map((entry) => ({
    href: docsHref(config, entry.id),
    title: entry.data.title,
    description: entry.data.description ?? "",
    text: (entry.body ?? "")
      .replace(/^---[\s\S]*?---/, "")
      .replace(/<[^>]*>|[#*`{}]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 6000),
  }));
  return new Response(JSON.stringify(documents), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
