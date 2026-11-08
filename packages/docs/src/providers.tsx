"use client";

import type { ComponentProps, ReactNode } from "react";
import { useDocsPage } from "fumadocs-ui/layouts/notebook/page";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@lenso/docs/presentation";

export function PageContainer({ className = "", ...props }: ComponentProps<"article">): ReactNode {
  const { full } = useDocsPage();
  const { children, ...rest } = props;
  const presentation = stylex.props(styles.content);
  return (
    <main
      {...rest}
      {...presentation}
      className={`${presentation.className} ${className}`}
      data-full={full}
    >
      <article id="nd-page" {...stylex.props(styles.article)}>
        {children}
      </article>
    </main>
  );
}
