import type { DocumentationCustomizationContext } from "@lenso/docs/react";
import { nativeApiFamily } from "./src/lib/native-api-section";
import { getNavigation, getSectionEntries, isLocale } from "./src/lib/source";
import { createLensoSiteOptions } from "./src/components/docs-site-options";
import { ComponentLinks } from "./src/components/component-links";
import { ViewOptions } from "./src/components/ai/page-actions";
import { DocsFooter } from "./src/components/docs-footer";
import { product } from "./src/lib/product";
import reference from "./src/generated/api-reference.json";

function localeOf(code: string) {
  if (!isLocale(code)) throw new Error(`Unsupported Lenso locale: ${code}`);
  return code;
}

function familyOf(slug: string) {
  const family = nativeApiFamily(slug);
  return family && Object.hasOwn(reference.families, family) ? family : undefined;
}

export async function getSiteOptions({ page }: DocumentationCustomizationContext) {
  const locale = localeOf(page.locale);
  return createLensoSiteOptions({
    locale,
    slug: page.slug,
    version: product.version,
    repository: product.repository,
    entries: await getNavigation(locale, page.slug.split("/")[1] ?? "getting-started"),
    sectionEntries: getSectionEntries(locale),
  });
}

export async function getPageOptions({ page }: DocumentationCustomizationContext) {
  const locale = localeOf(page.locale);
  const entries = await getNavigation(locale, page.slug.split("/")[1] ?? "getting-started");
  const pages = entries.filter((entry) => entry.href);
  const position = pages.findIndex((entry) => entry.href === page.url);
  const markdownFile = page.metadata?.["markdownFile"];
  if (typeof markdownFile !== "string") throw new Error(`Missing source path for ${page.id}.`);
  return {
    beforeContent: <ComponentLinks family={familyOf(page.slug)} />,
    actions: (
      <ViewOptions
        markdown={page.markdown}
        sourceUrl={`${product.repository}/blob/main/apps/docs/${page.slug.startsWith("react/components") ? "scripts/docs-projection.mjs" : markdownFile}`}
      />
    ),
    footer: (
      <DocsFooter previous={pages[position - 1]} next={pages[position + 1]} locale={locale} />
    ),
  };
}
