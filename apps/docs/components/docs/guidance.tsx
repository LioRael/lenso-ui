import type { ReactNode } from "react";

import { docsHeadingId } from "./heading";

export function Guidance({ children }: { children: ReactNode }) {
  return <section className="button-guidance mdx-guidance">{children}</section>;
}

export function GuidanceBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <article>
      <h2 data-toc-heading id={docsHeadingId(title)}>
        {title}
      </h2>
      <div className="guidance-content">{children}</div>
    </article>
  );
}
