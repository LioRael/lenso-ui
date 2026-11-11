import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/docs/page";
import { PageActions } from "./client";
import { ScopeControls } from "./scope-controls";
export function PageFrame({ page, tree }) {
  const adjacent = (item) => (item ? { name: item.title, url: item.href } : undefined);
  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "Documentation comparison" }}
      tabs={false}
      sidebar={{ prefetch: false }}
    >
      <DocsPage
        toc={page.toc}
        footer={{ items: { previous: adjacent(page.previous), next: adjacent(page.next) } }}
      >
        <DocsTitle>{page.title}</DocsTitle>
        <DocsDescription>{page.description}</DocsDescription>
        <ScopeControls page={page} />
        <PageActions markdown={page.markdown} href={page.markdownUrl} />
        <DocsBody lang={page.locale}>
          <div
            dangerouslySetInnerHTML={{
              __html: page.html.replace(/^<h1\b[^>]*>[\s\S]*?<\/h1>/, ""),
            }}
          />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}
