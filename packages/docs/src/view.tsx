import type { ComponentType, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import * as stylex from "@stylexjs/stylex";
import { LogoGithub, BookOpen, Globe } from "@gravity-ui/icons";
import type { Root, Node } from "fumadocs-core/page-tree";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import Link from "fumadocs-core/link";
import { DocumentationFooter, DocumentationThemeSwitch } from "./shell";
import {
  DocumentationSiteLayout,
  type DocumentationSiteLayoutProps,
  type DocumentationNavigationItem,
} from "./site-layout";
import { DocumentationSearch } from "./search";
import { DocumentationArticle } from "./article";
import { getDocumentationComponents } from "./mdx";
import { DocumentationPageActions } from "./page-actions";
import { styles, notebook } from "../dist/presentation.js";
import type { DocsConfig } from "./config.mjs";
import type { DocsRuntimePage as ContentPage } from "./content.mjs";
import type {
  DocumentationDocumentResult,
  DocumentationPageOptions,
  DocumentationSiteOptions,
} from "./customization";

export { DocumentationRoot } from "./root";

export function DocumentationPage({
  config,
  page,
  tree,
  Body,
  document,
  customComponents = {},
  siteSlots,
  siteOptions,
  pageOptions,
}: {
  config: DocsConfig;
  page: ContentPage;
  tree: Root;
  Body?: ComponentType<{ components: MDXComponents }>;
  document?: DocumentationDocumentResult;
  customComponents?: MDXComponents;
  siteSlots?: DocumentationSiteLayoutProps["slots"];
  siteOptions?: DocumentationSiteOptions;
  pageOptions?: DocumentationPageOptions;
}): ReactNode {
  const basePath = config.basePath ?? "";
  const hasLocaleRegistry = Array.isArray((config as DocsConfig & { locales?: unknown }).locales);
  const local = (value: string) =>
    value.startsWith("/") &&
    !value.startsWith("//") &&
    value !== basePath &&
    !value.startsWith(`${basePath}/`)
      ? `${basePath}${value}`
      : value;
  const components = getDocumentationComponents(basePath, customComponents);
  if (!document && !Body) {
    throw new Error("DocumentationPage requires either a document result or a Body component.");
  }
  function navigation(nodes: Node[]): DocumentationNavigationItem[] {
    return nodes.flatMap((node) => {
      const title = typeof node.name === "string" ? node.name : "";
      if (node.type === "page") return [{ title, url: node.url }];
      if (node.type === "folder")
        return [
          { title },
          ...(node.index ? [{ title: String(node.index.name), url: node.index.url }] : []),
          ...navigation(node.children),
        ];
      return [{ title }];
    });
  }
  const links = Object.entries(config.links ?? {}).map(([text, url]) => (
    <Link
      key={text}
      href={url}
      external={/^https?:\/\//.test(url)}
      aria-label={/^github$/i.test(text) ? `${config.title} on GitHub` : text}
      {...stylex.props(/^github$/i.test(text) ? notebook.iconButton : styles.link)}
    >
      {/^github$/i.test(text) ? <LogoGithub width={16} height={16} aria-hidden="true" /> : text}
    </Link>
  ));
  return (
    <TreeContextProvider tree={tree}>
      <DocumentationSiteLayout
        brand={
          siteOptions?.brand ?? {
            title: config.title,
            url: "/",
            ...(config.logo
              ? { logo: <img src={local(config.logo)} alt="" width={28} height={28} /> }
              : {}),
          }
        }
        currentUrl={siteOptions?.currentUrl ?? page.url.slice(basePath.length)}
        activeSection={siteOptions?.activeSection ?? "docs"}
        sections={
          siteOptions?.sections ?? [
            {
              id: "docs",
              title: "Documentation",
              url: "/",
              icon: <BookOpen width={16} height={16} aria-hidden="true" />,
            },
          ]
        }
        navigation={siteOptions?.navigation ?? navigation(tree.children)}
        {...(siteOptions?.navigationStateKey !== undefined
          ? { navigationStateKey: siteOptions.navigationStateKey }
          : {})}
        slots={{
          search: (
            <DocumentationSearch
              from={
                hasLocaleRegistry
                  ? `${basePath}/_lenso/search/${page.locale}.json`
                  : `${basePath}/_lenso/search.json`
              }
            />
          ),
          desktopActions: (
            <>
              {links}
              <DocumentationThemeSwitch />
            </>
          ),
          drawerActions: <DocumentationThemeSwitch />,
          sectionTrailing: (
            <>
              <Globe width={14} height={14} aria-hidden="true" /> Web
            </>
          ),
          drawerFooter: (
            <nav aria-label="Project links">
              {Object.entries(config.links ?? {}).map(([text, url]) => (
                <Link
                  key={text}
                  href={url}
                  external={/^https?:\/\//.test(url)}
                  {...stylex.props(styles.link)}
                >
                  {text}
                </Link>
              ))}
            </nav>
          ),
          ...siteSlots,
          ...siteOptions?.slots,
        }}
      >
        <DocumentationArticle
          kind={page.kind}
          title={page.title}
          description={page.description}
          headings={document?.headings ?? page.headings}
          locale={
            (
              config as DocsConfig & {
                locales?: { code: string; language: string }[];
              }
            ).locales?.find((item) => item.code === page.locale)?.language ??
            config.language ??
            page.locale
          }
          actions={
            pageOptions?.actions ?? (
              <DocumentationPageActions
                markdown={page.markdown}
                markdownUrl={`${basePath}/_lenso/markdown/${page.id}.md`}
              />
            )
          }
          beforeContent={pageOptions?.beforeContent}
          footer={pageOptions?.footer ?? <DocumentationFooter />}
        >
          {document ? document.content : Body ? <Body components={components} /> : null}
        </DocumentationArticle>
      </DocumentationSiteLayout>
    </TreeContextProvider>
  );
}
