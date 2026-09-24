"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { DocsPage, DocsSectionId } from "../../contents/catalog";
import { docsHeadingId } from "./heading";

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
      article.querySelectorAll<HTMLElement>(".docs-prose > h2, .docs-prose > h3"),
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
      <article className="docs-article" data-document-main={slug}>
        <div className="docs-article-heading">
          <p className="docs-article-eyebrow">{eyebrow ?? sectionLabel}</p>
          <h1>{title}</h1>
          <p className="docs-article-description">{description}</p>
        </div>
        <div className="docs-prose" data-layout={layout}>
          {children}
        </div>
      </article>
      {showToc && (
        <aside aria-label="On this page" className="docs-toc">
          <p>On this page</p>
          <nav>
            {headings.map((heading) => (
              <a
                className={`docs-toc-link${heading.depth === 3 ? " is-nested" : ""}`}
                href={`#${heading.id}`}
                key={heading.id}
              >
                {heading.label}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
