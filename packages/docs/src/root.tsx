import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { RootProvider } from "fumadocs-ui/provider/base";
import { styles } from "@lenso/docs/presentation";
import type { DocsConfig } from "./config.ts";
import type { DocumentationRootOptions } from "./customization";
import type { DocumentationLocale } from "./document-model";

export function DocumentationRoot({
  config,
  children,
  locale,
  options,
}: {
  config: DocsConfig;
  children: ReactNode;
  locale?: DocumentationLocale;
  options?: DocumentationRootOptions;
}): ReactNode {
  const body = stylex.props(styles.body);
  const Providers = options?.Providers;
  const bodyClassName = options?.bodyClassName ?? "lenso-docs";
  const content = (
    <>
      <a href="#main-content" {...stylex.props(styles.skip)}>
        {options?.skipLabel ??
          (locale?.code === "cn" || locale?.language?.startsWith("zh")
            ? "跳至内容"
            : "Skip to content")}
      </a>
      {children}
    </>
  );
  return (
    <html
      lang={locale?.language ?? config.language ?? "en"}
      suppressHydrationWarning
      // Seed the inline scroll-lock property to avoid WebKit invalidating the whole document.
      style={{ overflow: "auto" }}
    >
      <body {...body} className={`${body.className} ${bodyClassName}`}>
        {Providers ? (
          <Providers locale={locale?.code ?? "en"}>{content}</Providers>
        ) : (
          <RootProvider
            search={{ enabled: false }}
            theme={{ defaultTheme: "system", enableSystem: true }}
          >
            {content}
          </RootProvider>
        )}
      </body>
    </html>
  );
}
