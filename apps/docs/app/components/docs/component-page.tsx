"use client";

import * as React from "react";

import { DocsShell } from "../../docs-shell";
import { useDocsPageTheme } from "../../use-docs-page-theme";

interface ComponentPageProps {
  children: React.ReactNode;
  description: string;
  name: string;
  packageName: string;
  section: string;
  slug: "button" | "dialog";
}

export function ComponentPage({
  children,
  description,
  name,
  packageName,
  section,
  slug,
}: ComponentPageProps) {
  const theme = useDocsPageTheme();

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", name]}
      current={slug}
      theme={theme}
    >
      <div className="button-docs-content mdx-component-content">
        <section className="button-overview">
          <p className="button-eyebrow">{section.toUpperCase()}</p>
          <h1>{name}</h1>
          <p className="button-description">{description}</p>
          <div className="metadata-pills button-metadata">
            <span>{packageName}</span>
            <span>Registry ready</span>
          </div>
        </section>
        {children}
      </div>
    </DocsShell>
  );
}
