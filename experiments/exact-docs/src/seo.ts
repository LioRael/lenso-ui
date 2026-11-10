import path from "node:path";
import type { Document, Site } from "./index.ts";
import { escapeHtml } from "./renderers/html.ts";

export function pageSeo(doc: Document | undefined, site: Site) {
  const lang = doc?.locale || site.config.defaultLocale || "en";
  const dir = site.config.locales.find((locale) => locale.id === lang)?.dir ?? "ltr";
  const matches =
    doc && site.config.origin && site.config.locales.length
      ? site.documents.filter(
          (other) => other.id === doc.id && other.version === doc.version && !other.noindex,
        )
      : [];
  const alternates = matches.map((other) => ({
    lang: other.locale,
    href: new URL(other.path, site.config.origin).href,
  }));
  const fallback = matches.find((other) => other.locale === site.config.defaultLocale);
  if (fallback)
    alternates.push({ lang: "x-default", href: new URL(fallback.path, site.config.origin).href });
  return {
    lang,
    dir,
    alternates,
    canonical: doc && site.config.origin ? new URL(doc.path, site.config.origin).href : "",
    robots: !doc || doc.noindex ? "noindex,follow" : "index,follow",
  };
}

export function decoratePageHtml(html: string, doc: Document | undefined, site: Site) {
  const meta = pageSeo(doc, site);
  const tags = meta.alternates
    .map(
      (item) =>
        `<link rel="alternate" hreflang="${escapeHtml(item.lang)}" href="${escapeHtml(item.href)}" data-docs-alternate>`,
    )
    .join("");
  return html
    .replace(
      /<html\b([^>]*)>/i,
      (_tag, attrs: string) =>
        `<html${attrs.replace(/\s(?:lang|dir)="[^"]*"/g, "")} lang="${escapeHtml(meta.lang)}" dir="${meta.dir}">`,
    )
    .replace(
      /(<meta\s+charset[^>]*>)/i,
      `$1${tags}<script type="module" src="/_docs/metadata.js"></script>`,
    );
}

export async function writeSeo(site: Site, out: string) {
  const built = await Bun.build({
    entrypoints: [path.join(import.meta.dirname, "web/metadata.ts")],
    outdir: path.join(out, "_docs"),
    target: "browser",
    minify: true,
    naming: "metadata.js",
  });
  if (!built.success) throw new AggregateError(built.logs, "Metadata module build failed");
  if (!site.config.origin) return;
  const entries = site.documents
    .filter((doc) => !doc.noindex)
    .map(
      (doc) =>
        `<url><loc>${escapeHtml(new URL(doc.path, site.config.origin).href)}</loc>${pageSeo(
          doc,
          site,
        )
          .alternates.map(
            (item) =>
              `<xhtml:link rel="alternate" hreflang="${escapeHtml(item.lang)}" href="${escapeHtml(item.href)}"/>`,
          )
          .join("")}</url>`,
    );
  await Bun.write(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join("")}</urlset>`,
  );
  await Bun.write(
    path.join(out, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${site.config.origin}/sitemap.xml\n`,
  );
}
