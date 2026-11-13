"use client";

import type { ComponentProps, ReactNode } from "react";
import { useDocsPage } from "fumadocs-ui/layouts/notebook/page";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@lenso/docs/presentation";

type PageContainerProps = ComponentProps<"article"> & { "data-documentation-kind"?: string };

export function PageContainer({ className = "", ...props }: PageContainerProps): ReactNode {
  const { full } = useDocsPage();
  const { children, ...rest } = props;
  const presentation = stylex.props(
    styles.content,
    rest["data-documentation-kind"] === "component" && styles.componentContent,
  );
  return (
    <main
      {...rest}
      {...presentation}
      className={`${presentation.className} ${className}`}
      data-full={full}
    >
      <article
        id="nd-page"
        {...stylex.props(
          styles.article,
          rest["data-documentation-kind"] === "component" && styles.componentArticle,
          full && styles.fullArticle,
        )}
      >
        {children}
      </article>
    </main>
  );
}
