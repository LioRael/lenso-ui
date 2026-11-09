import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { DocumentationArticle } from "@lenso/docs/react";
import { documents } from "../lib/content";
import { canonicalSlug, getPage, isLocale } from "../lib/source";
import { getPageOptions } from "../components/docs-page-options";
import { routeHead } from "../lib/route-head";
export const Route = createFileRoute("/$locale/docs/$")({
  // The MDX registry belongs to document visits, including their loader.
  codeSplitGroupings: [["loader", "component"]],
  staleTime: Infinity,
  loader: async ({ params }) => {
    if (!isLocale(params.locale)) throw notFound();
    const slug = canonicalSlug(params._splat ?? "");
    if (slug !== params._splat)
      throw redirect({ to: "/$locale/docs/$", params: { locale: params.locale, _splat: slug } });
    const page = getPage(params.locale, slug);
    const file = page && documents.getPage(page.markdownFile.slice("content/lenso/".length));
    if (!page || !file) throw notFound();
    await file.preload();
    return {
      locale: params.locale,
      slug,
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
  return <Content {...data} />;
}
function Content({ locale, slug }: { locale: "en" | "cn"; slug: string }) {
  const page = getPage(locale, slug)!;
  const file = documents.getPage(page.markdownFile.slice("content/lenso/".length))!;
  const { components, default: Body, lensoHeadings } = file.read();
  const options = getPageOptions({
    page: { ...page, metadata: { markdownFile: page.markdownFile } },
  });
  return (
    <DocumentationArticle
      title={page.title}
      description={page.description}
      locale={locale}
      kind={page.kind}
      headings={lensoHeadings}
      {...options}
    >
      <Body components={components} />
    </DocumentationArticle>
  );
}
