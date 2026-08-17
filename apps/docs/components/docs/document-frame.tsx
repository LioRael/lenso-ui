"use client";

import type { ReactNode } from "react";

import { DocsShell, type DocsPage } from "./shell";
import { TableOfContents } from "./table-of-contents";
import { useDocsPageTheme } from "./use-docs-page-theme";
import type { DocsSectionId } from "../../contents/catalog";

const defaultComponentActions = ["View source", "Install"] as const;
const defaultDocumentActions = ["Edit page", "Copy link"] as const;
const defaultOverviewActions = ["Components", "Get started"] as const;
const sectionLabels: Record<DocsSectionId, string> = {
  components: "Components",
  foundations: "Foundations",
  guides: "Guides",
  patterns: "Patterns",
  primitives: "Primitives",
  reference: "Reference",
  start: "Start",
  templates: "Templates",
};

interface DocumentFrameProps {
  actions?: readonly [string, string] | undefined;
  children: ReactNode;
  description: string;
  eyebrow?: string | undefined;
  layout: "component" | "document" | "overview";
  metadata?: readonly [string, string] | undefined;
  section: DocsSectionId;
  slug: DocsPage;
  title: string;
}

function ComponentOverview({
  description,
  eyebrow,
  metadata,
  slug,
  title,
}: {
  description: string;
  eyebrow: string;
  metadata: readonly [string, string];
  slug: DocsPage;
  title: string;
}) {
  return (
    <section className={["button-overview", `${slug}-overview`].join(" ")}>
      <p className="button-eyebrow">{eyebrow.toUpperCase()}</p>
      <h1>{title}</h1>
      <p className="button-description">{description}</p>
      <div className="metadata-pills button-metadata">
        <span>{metadata[0]}</span>
        <span>{metadata[1]}</span>
      </div>
    </section>
  );
}

export function DocumentFrame({
  actions,
  children,
  description,
  eyebrow,
  layout,
  metadata,
  section,
  slug,
  title,
}: DocumentFrameProps) {
  const theme = useDocsPageTheme();
  const isOverview = layout === "overview";
  const contentClassName =
    slug === "application-sidebar" ? "sidebar-docs-content" : `${slug}-docs-content`;

  if (!isOverview && (!eyebrow || !metadata)) {
    throw new Error(`Component document ${slug} must define eyebrow and metadata frontmatter`);
  }

  return (
    <DocsShell
      actions={
        actions ??
        (isOverview
          ? defaultOverviewActions
          : layout === "document"
            ? defaultDocumentActions
            : defaultComponentActions)
      }
      breadcrumbs={[isOverview ? "Documentation" : sectionLabels[section], title]}
      current={slug}
      theme={theme}
    >
      {isOverview ? (
        <div className="docs-content">{children}</div>
      ) : layout === "document" ? (
        <div className="document-docs-content mdx-document-content">
          <div className="document-layout">
            <article className="document-main" data-document-main={slug}>
              <section className="document-hero">
                <p className="document-eyebrow">{eyebrow?.toUpperCase()}</p>
                <h1>{title}</h1>
                <p className="document-description">{description}</p>
                {metadata && <p className="document-metadata">{metadata.join(" · ")}</p>}
              </section>
              {children}
            </article>
            <TableOfContents page={slug} />
          </div>
        </div>
      ) : (
        <div
          className={["button-docs-content", "mdx-component-content", contentClassName].join(" ")}
        >
          <ComponentOverview
            description={description}
            eyebrow={eyebrow!}
            metadata={metadata!}
            slug={slug}
            title={title}
          />
          {children}
        </div>
      )}
    </DocsShell>
  );
}
