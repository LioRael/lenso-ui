import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { DocsPage, DocsTitle } from "fumadocs-ui/layouts/notebook/page";
import { PageContainer } from "./providers";
import { PageTableOfContents } from "@lenso/docs/toc";
import { styles, notebook } from "@lenso/docs/presentation";
import type { DocsHeading } from "./content.mjs";
import type { DocumentationKind } from "./document-model";

export interface DocumentationArticleProps {
  title: string;
  description?: string;
  headings: readonly DocsHeading[];
  locale?: string;
  children: ReactNode;
  actions?: ReactNode;
  beforeContent?: ReactNode;
  footer?: ReactNode;
  kind?: DocumentationKind;
}

/** The host owns routing, content projection and optional site controls. */
export function DocumentationArticle({
  title,
  description,
  headings,
  locale = "en",
  children,
  actions,
  beforeContent,
  footer,
  kind = "docs",
}: DocumentationArticleProps): ReactNode {
  const chinese = locale === "cn" || locale.startsWith("zh");
  return (
    <>
      <PageTableOfContents items={[...headings]} locale={chinese ? "cn" : "en"} title={title} />
      <DocsPage
        id="main-content"
        lang={chinese ? "zh-CN" : locale}
        tabIndex={-1}
        data-documentation-kind={kind}
        slots={{ container: PageContainer }}
        breadcrumb={{ enabled: false }}
        footer={{ enabled: false }}
        tableOfContent={{ enabled: false }}
        tableOfContentPopover={{ enabled: false }}
      >
        <div {...stylex.props(notebook.headingRow)}>
          <DocsTitle {...stylex.props(styles.title)}>{title}</DocsTitle>
          {actions}
        </div>
        {description && <p {...stylex.props(styles.description)}>{description}</p>}
        {beforeContent}
        <div className="lenso-prose">{children}</div>
        {footer}
      </DocsPage>
    </>
  );
}
