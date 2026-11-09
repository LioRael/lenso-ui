import { nativeApiFamily } from "../lib/native-api-section";
import { docsIndex, getNavigation, isLocale, readPage } from "../lib/source";
import { ComponentLinks } from "./component-links";
import { ViewOptions } from "./ai/page-actions";
import { DocsFooter } from "./docs-footer";
import { lazy, Suspense } from "react";
const MaterialsPreview = lazy(() =>
  import("./materials-preview").then((module) => ({ default: module.MaterialsPreview })),
);
const SemanticColorExamples = lazy(() =>
  import("./semantic-color-examples").then((module) => ({ default: module.SemanticColorExamples })),
);
import { product } from "../lib/product";

function localeOf(code: string) {
  if (!isLocale(code)) throw new Error(`Unsupported Lenso locale: ${code}`);
  return code;
}

function familyOf(slug: string) {
  const family = nativeApiFamily(slug);
  return family && Object.hasOwn(docsIndex.families, family) ? family : undefined;
}

export function getPageOptions({
  page,
}: {
  page: {
    locale: string;
    slug: string;
    url: string;
    markdownFile: string;
    metadata?: Record<string, unknown>;
  };
}) {
  const locale = localeOf(page.locale);
  const entries = getNavigation(locale, page.slug.split("/")[1] ?? "getting-started");
  const pages = entries
    .flatMap((entry) => ("children" in entry ? entry.children : [entry]))
    .filter((entry) => entry.href);
  const position = pages.findIndex((entry) => entry.href === page.url);
  const markdownFile = page.metadata?.["markdownFile"];
  if (typeof markdownFile !== "string") throw new Error(`Missing source path for ${page.slug}.`);
  return {
    beforeContent:
      page.slug === "react/getting-started/materials" ? (
        <Suspense fallback={null}>
          <MaterialsPreview chinese={locale === "cn"} />
        </Suspense>
      ) : page.slug === "react/getting-started/colors" ? (
        <Suspense fallback={null}>
          <SemanticColorExamples chinese={locale === "cn"} />
        </Suspense>
      ) : (
        <ComponentLinks family={familyOf(page.slug)} locale={locale} />
      ),
    actions: (
      <ViewOptions
        locale={locale}
        loadMarkdown={() => readPage(page)}
        sourceUrl={`${product.repository}/blob/main/apps/docs/${page.slug.startsWith("react/components") ? "scripts/docs-projection.ts" : markdownFile}`}
      />
    ),
    footer: (
      <DocsFooter previous={pages[position - 1]} next={pages[position + 1]} locale={locale} />
    ),
  };
}
