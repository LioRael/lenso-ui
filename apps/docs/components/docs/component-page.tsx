"use client";

import * as React from "react";

import { DocsShell, type DocsPage } from "./shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

const defaultActions = ["View source", "Install"] as const;

interface ComponentOverviewProps {
  description: string;
  eyebrow: string;
  metadata: readonly [string, string];
  name: string;
  overviewClassName?: string;
}

export function ComponentOverview({
  description,
  eyebrow,
  metadata,
  name,
  overviewClassName,
}: ComponentOverviewProps) {
  return (
    <section className={["button-overview", overviewClassName].filter(Boolean).join(" ")}>
      <p className="button-eyebrow">{eyebrow.toUpperCase()}</p>
      <h1>{name}</h1>
      <p className="button-description">{description}</p>
      <div className="metadata-pills button-metadata">
        <span>{metadata[0]}</span>
        <span>{metadata[1]}</span>
      </div>
    </section>
  );
}

interface ComponentPageProps {
  actions?: readonly [string, string];
  children: React.ReactNode;
  contentClassName?: string;
  description: string;
  eyebrow: string;
  metadata: readonly [string, string];
  name: string;
  overviewClassName?: string;
  slug: DocsPage;
}

export function ComponentPage({
  actions = defaultActions,
  children,
  contentClassName,
  description,
  eyebrow,
  metadata,
  name,
  overviewClassName,
  slug,
}: ComponentPageProps) {
  const theme = useDocsPageTheme();

  return (
    <DocsShell actions={actions} breadcrumbs={["Components", name]} current={slug} theme={theme}>
      <div
        className={["button-docs-content", "mdx-component-content", contentClassName]
          .filter(Boolean)
          .join(" ")}
      >
        <ComponentOverview
          description={description}
          eyebrow={eyebrow}
          metadata={metadata}
          name={name}
          {...(overviewClassName ? { overviewClassName } : {})}
        />
        {children}
      </div>
    </DocsShell>
  );
}
