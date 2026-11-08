import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Suspense, use, useMemo } from "react";
import type { MDXComponents } from "mdx/types";
import { DocumentationArticle, type DocumentationArticleProps } from "@lenso/docs/react";
import { documents } from "../lib/content";
import { canonicalSlug, getPage, isLocale, readPage } from "../lib/source";
import { getPageOptions } from "../components/docs-page-options";
import { routeHead } from "../lib/route-head";
interface DocumentExports {
  getComponents: () => MDXComponents;
  lensoHeadings: DocumentationArticleProps["headings"];
}
export const Route = createFileRoute("/$locale/docs/$")({
  loader: async ({ params }) => {
    if (!isLocale(params.locale)) throw notFound();
    const slug = canonicalSlug(params._splat ?? "");
    if (slug !== params._splat)
      throw redirect({ to: "/$locale/docs/$", params: { locale: params.locale, _splat: slug } });
    const page = getPage(params.locale, slug);
    const file = page && documents.getPage(page.markdownFile.slice("content/lenso/".length));
    if (!page || !file) throw notFound();
    const [, markdown] = await Promise.all([file.preload(), readPage(page)]);
    return {
      locale: params.locale,
      slug,
      markdown,
      title: page.title,
      description: page.description,
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? routeHead(
          loaderData.title + " · Lenso UI",
          loaderData.description,
          loaderData.locale,
          `/${loaderData.locale}/docs/${loaderData.slug}`,
          { en: `/en/docs/${loaderData.slug}`, cn: `/cn/docs/${loaderData.slug}` },
        )
      : {},
  component: Page,
});
function Page() {
  const data = Route.useLoaderData();
  return (
    <Suspense fallback={<output>Loading document…</output>}>
      <Content {...data} />
    </Suspense>
  );
}
function Content({
  locale,
  slug,
  markdown,
}: {
  locale: "en" | "cn";
  slug: string;
  markdown: string;
}) {
  const page = getPage(locale, slug)!;
  const file = documents.getPage(page.markdownFile.slice("content/lenso/".length))!;
  const data = use(file.load());
  const exports = data._exports as unknown as DocumentExports;
  const components = useMemo(() => exports.getComponents(), [exports]);
  const options = getPageOptions({
    page: { ...page, markdown, metadata: { markdownFile: page.markdownFile } },
  });
  const Body = file.body;
  return (
    <DocumentationArticle
      title={page.title}
      description={page.description}
      locale={locale}
      kind={page.kind}
      headings={exports.lensoHeadings}
      {...options}
    >
      <Body components={components} />
    </DocumentationArticle>
  );
}
