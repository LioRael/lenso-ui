"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { DocsPage, DocsSectionId } from "../../contents/catalog";
import { docsHeadingId } from "./heading";
import { TableOfContents } from "./table-of-contents";

interface DocumentFrameProps {
  children: ReactNode;
  description: string;
  eyebrow?: string | undefined;
  layout: "component" | "document" | "overview";
  metadata?: readonly [string, string] | undefined;
  section: DocsSectionId;
  slug: DocsPage;
  title: string;
}

interface Heading {
  id: string;
  label: string;
  depth: number;
}

export function DocumentFrame({
  children,
  description,
  eyebrow,
  layout,
  section,
  slug,
  title,
}: DocumentFrameProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(`[data-document-main="${slug}"]`);
    if (!article) return;
    const found = Array.from(
      article.querySelectorAll<HTMLElement>(
        ".docs-prose > h2, .docs-prose > h3, .docs-prose [data-toc-heading]",
      ),
    );
    const used = new Set<string>();
    const next = found
      .map((heading) => {
        const label = heading.textContent?.trim() ?? "";
        const base = heading.id || docsHeadingId(label);
        let id = base;
        for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`;
        used.add(id);
        heading.id = id;
        return { id, label, depth: Number(heading.tagName.slice(1)) };
      })
      .filter((heading) => heading.label);
    setHeadings(next);
  }, [slug]);

  const workspace = slug === "tokens" || slug === "theme-lab";
  const showToc = !workspace && headings.length > 0;
  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <div
      className={`docs-content-layout${showToc ? " has-toc" : ""}${workspace ? " is-workspace" : ""}`}
    >
      {showToc && (
        <div className="docs-toc">
          <TableOfContents items={headings} page={slug} />
          <TableOfContents items={headings} mobile page={slug} />
        </div>
      )}
      <article className="docs-article" data-document-main={slug}>
        {!workspace && (
          <div className="docs-article-heading">
            <p className="docs-article-eyebrow">{eyebrow ?? sectionLabel}</p>
            <h1>{title}</h1>
            <p className="docs-article-description">{description}</p>
          </div>
        )}
        <div className="docs-prose" data-layout={layout}>
          {children}
        </div>
      </article>
    </div>
  );
}
