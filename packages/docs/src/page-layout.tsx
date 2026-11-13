import type { ComponentType, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import * as stylex from "@stylexjs/stylex";
import { LogoGithub } from "@gravity-ui/icons";
import type { Root, Node } from "fumadocs-core/page-tree";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import Link from "fumadocs-core/link";
import { GlassButton } from "@lenso/ui/glass-button";
import { DocsThemePicker } from "./docs-theme-picker";
import { DocumentationFooter, DocumentationThemeSwitch } from "./shell";
import {
  DocumentationSiteLayout,
  type DocumentationSiteLayoutProps,
  type DocumentationNavigationItem,
} from "./site-layout";
import { DocumentationSearch, DocumentationSearchRevision } from "./search";
import { DocumentationArticle } from "./article";
import { DocumentationPageActions } from "./page-actions";
import { DocumentationLanguageToggle } from "./language-toggle";
import { getDocumentationMessages, resolveDocumentationLocale } from "./language";
import type { DocumentationLocale } from "./document-model";
import { styles, headerControls } from "@lenso/docs/presentation";
import type { DocsConfig } from "./config.ts";
import type { DocsRuntimePage as ContentPage } from "./content.ts";
import type {
  DocumentationDocumentResult,
  DocumentationPageOptions,
  DocumentationSiteOptions,
} from "./customization";

export { DocumentationRoot } from "./root";

export function DocumentationPageLayout({
  config,
  page,
  tree,
  Body,
  document,
  customComponents = {},
  siteSlots,
  siteOptions,
  pageOptions,
  searchRevision = "",
  alternates = [],
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
  searchRevision?: string;
  alternates?: readonly (DocumentationLocale & { url: string })[];
}): ReactNode {
  const basePath = config.basePath ?? "";
  const hasLocaleRegistry = config.locales !== undefined;
  const locale = resolveDocumentationLocale(page.locale, config.locales);
  const language = hasLocaleRegistry ? locale.language : (config.language ?? locale.language);
  const messages = getDocumentationMessages(language);
  const themeLocale = /^zh(?:-|$)/iu.test(language) || language === "cn" ? "cn" : "en";
  const languageToggle = (
    <DocumentationLanguageToggle
      locale={page.locale}
      alternates={alternates.map((alternate) => ({
        ...alternate,
        // Router links add the deployment prefix; source URLs already contain it.
        url: alternate.url.slice(basePath.length) || "/",
      }))}
    />
  );
  const local = (value: string) =>
    value.startsWith("/") &&
    !value.startsWith("//") &&
    value !== basePath &&
    !value.startsWith(`${basePath}/`)
      ? `${basePath}${value}`
      : value;
  let content: ReactNode;
  if (document) content = document.content;
  else if (Body) content = <Body components={customComponents} />;
  else {
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
    <GlassButton
      key={text}
      // The Glass control renders a navigation anchor.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="link"
      render={<Link href={url} external={/^https?:\/\//.test(url)} />}
      isIconOnly={/^github$/i.test(text)}
      aria-label={/^github$/i.test(text) ? `${config.title} on GitHub` : text}
      xstyle={[
        headerControls.control,
        /^github$/i.test(text) && headerControls.icon,
        headerControls.link,
      ]}
    >
      {/^github$/i.test(text) ? <LogoGithub width={16} height={16} aria-hidden="true" /> : text}
    </GlassButton>
  ));
  return (
    <DocumentationSearchRevision revision={searchRevision}>
      <TreeContextProvider tree={tree}>
        <DocumentationSiteLayout
          locale={page.locale}
          brand={
            siteOptions?.brand ?? {
              title: config.title,
              url: config.locales?.find((item) => item.code === page.locale)?.routePrefix ?? "/",
              ...(config.logo
                ? { logo: <img src={local(config.logo)} alt="" width={28} height={28} /> }
                : {}),
            }
          }
          currentUrl={siteOptions?.currentUrl ?? page.url.slice(basePath.length)}
          activeSection={siteOptions?.activeSection ?? "docs"}
          sections={siteOptions?.sections ?? []}
          navigation={siteOptions?.navigation ?? navigation(tree.children)}
          {...(siteOptions?.navigationStateKey !== undefined
            ? { navigationStateKey: siteOptions.navigationStateKey }
            : {})}
          slots={{
            search: (
              <DocumentationSearch
                compact
                from={
                  hasLocaleRegistry
                    ? `${basePath}/_lenso/search/${page.locale}.json`
                    : `${basePath}/_lenso/search.json`
                }
              />
            ),
            desktopActions: (
              <>
                {languageToggle}
                <DocsThemePicker locale={themeLocale} />
                <DocumentationThemeSwitch />
                {links}
              </>
            ),
            drawerActions: (
              <>
                {languageToggle}
                <DocumentationThemeSwitch />
              </>
            ),
            mobileActions: <DocsThemePicker locale={themeLocale} />,
            drawerFooter: (
              <nav aria-label={messages.projectLinks}>
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
            locale={language}
            actions={
              pageOptions?.actions ?? (
                <DocumentationPageActions
                  locale={language}
                  markdown={page.markdown}
                  markdownUrl={`${basePath}/_lenso/markdown/${page.id}.md`}
                />
              )
            }
            beforeContent={pageOptions?.beforeContent}
            footer={pageOptions?.footer ?? <DocumentationFooter />}
          >
            {content}
          </DocumentationArticle>
        </DocumentationSiteLayout>
      </TreeContextProvider>
    </DocumentationSearchRevision>
  );
}
