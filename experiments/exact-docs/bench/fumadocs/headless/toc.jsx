"use client";
import { AnchorProvider, TOCItem } from "fumadocs-core/toc";
export function Contents({ toc, children }) {
  return (
    <AnchorProvider toc={toc}>
      {children}
      <nav aria-label="On this page">
        {toc.map((item) => (
          <TOCItem key={item.url} href={item.url}>
            {item.title}
          </TOCItem>
        ))}
      </nav>
    </AnchorProvider>
  );
}
