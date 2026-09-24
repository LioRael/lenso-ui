import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import config from "virtual:lenso-docs-config";

import { docsHref } from "../config";

export const GET: APIRoute = async ({ site }) => {
  const entries = await getCollection("docs", ({ data }) => !data.draft);
  const lines = [`# ${config.title}`, config.description ? `> ${config.description}` : "", ""];
  for (const entry of entries.sort((a, b) => a.id.localeCompare(b.id))) {
    const href = docsHref(config, entry.id);
    const url = config.site || site ? new URL(href, config.site ?? site).href : href;
    lines.push(
      `- [${entry.data.title}](${url})${entry.data.description ? `: ${entry.data.description}` : ""}`,
    );
  }
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
