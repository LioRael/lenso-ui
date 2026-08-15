import type { ReactNode } from "react";

export function Guidance({ children }: { children: ReactNode }) {
  return <section className="button-guidance mdx-guidance">{children}</section>;
}

export function GuidanceBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <article>
      <h2>{title}</h2>
      {children}
    </article>
  );
}
