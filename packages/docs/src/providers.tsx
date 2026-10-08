"use client";

import type { ComponentProps, ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { useDocsPage } from "fumadocs-ui/layouts/notebook/page";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@lenso/docs/presentation";

export function PageContainer({ className = "", ...props }: ComponentProps<"article">): ReactNode {
  const {
    props: { full },
  } = useDocsPage();
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

export function DocumentationProviders({ children }: { children: ReactNode }): ReactNode {
  return (
    <RootProvider
      search={{ enabled: false }}
      theme={{ defaultTheme: "system", enableSystem: true }}
    >
      {children}
    </RootProvider>
  );
}
