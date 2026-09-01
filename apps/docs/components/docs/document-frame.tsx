"use client";

import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { DocsShell, type DocsPage } from "./shell";
import { TableOfContents } from "./table-of-contents";
import { useDocsPageTheme } from "./use-docs-page-theme";
import type { DocsSectionId } from "../../contents/catalog";
import { styles } from "./document-frame.stylex";

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
  layout: "component" | "document" | "overview";
  metadata?: readonly [string, string] | undefined;
  section: DocsSectionId;
  slug: DocsPage;
  title: string;
}

function ComponentOverview({
  description,
  metadata,
  title,
}: {
  description: string;
  metadata: readonly [string, string];
  title: string;
}) {
  return (
    <section {...stylex.props(styles.componentOverview)}>
      <h1 {...stylex.props(styles.componentTitle)}>{title}</h1>
      <p {...stylex.props(styles.componentDescription)}>{description}</p>
      <div {...stylex.props(styles.componentMetadata)}>
        <span {...stylex.props(styles.metadataPill)}>{metadata[0]}</span>
        <span {...stylex.props(styles.metadataPill)}>{metadata[1]}</span>
      </div>
    </section>
  );
}

export function DocumentFrame({
  actions,
  children,
  description,
  layout,
  metadata,
  section,
  slug,
  title,
}: DocumentFrameProps) {
  const theme = useDocsPageTheme();
  const isOverview = layout === "overview";
  const isWorkspace = slug === "theme-lab" || slug === "tokens";

  if (!isOverview && !metadata) {
    throw new Error(`Component document ${slug} must define metadata frontmatter`);
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
        <div {...stylex.props(styles.standardContent)}>{children}</div>
      ) : layout === "document" ? (
        <div
          {...stylex.props(
            styles.documentContent,
            isWorkspace && styles.workspaceContent,
            slug === "theme-lab" && styles.themeLabContent,
          )}
        >
          <div {...stylex.props(styles.documentLayout, isWorkspace && styles.workspaceLayout)}>
            <article
              {...stylex.props(styles.documentMain, isWorkspace && styles.workspaceMain)}
              data-document-main={slug}
            >
              {!isWorkspace && (
                <section {...stylex.props(styles.hero)}>
                  <h1 {...stylex.props(styles.heroTitle)}>{title}</h1>
                  <p {...stylex.props(styles.heroDescription)}>{description}</p>
                  {metadata && <p {...stylex.props(styles.heroMetadata)}>{metadata.join(" · ")}</p>}
                </section>
              )}
              {children}
            </article>
            {!isWorkspace && <TableOfContents page={slug} />}
          </div>
        </div>
      ) : (
        <div {...stylex.props(styles.standardContent, styles.componentContent)}>
          <ComponentOverview description={description} metadata={metadata!} title={title} />
          {children}
        </div>
      )}
    </DocsShell>
  );
}
