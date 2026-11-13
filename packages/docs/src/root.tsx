import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { RootProvider } from "fumadocs-ui/provider/base";
import { styles } from "@lenso/docs/presentation";
import { DocsDesignThemeProvider } from "./docs-design-theme";
import { DocumentationI18nProvider } from "./i18n";
import { getDocumentationMessages, resolveDocumentationLocale } from "./language";
import type { DocsConfig } from "./config.ts";
import type { DocumentationRootOptions } from "./customization";
import type { DocumentationLocale } from "./document-model";

export function DocumentationRoot({
  config,
  children,
  locale,
  options,
  head,
  scripts,
}: {
  config: DocsConfig;
  children: ReactNode;
  head?: ReactNode;
  scripts?: ReactNode;
  locale?: DocumentationLocale;
  options?: DocumentationRootOptions;
}): ReactNode {
  const body = stylex.props(styles.body);
  const Providers = options?.Providers;
  const bodyClassName = options?.bodyClassName ?? "lenso-docs";
  const currentLocale =
    locale ??
    resolveDocumentationLocale(
      config.defaultLocale ?? config.locales?.[0]?.code ?? config.language ?? "en",
      config.locales,
    );
  const messages = getDocumentationMessages(currentLocale.language);
  const content = (
    <DocumentationI18nProvider locale={currentLocale} locales={config.locales ?? [currentLocale]}>
      <DocsDesignThemeProvider>
        <a href="#main-content" {...stylex.props(styles.skip)}>
          {options?.skipLabel ?? messages.skip}
        </a>
        {children}
      </DocsDesignThemeProvider>
    </DocumentationI18nProvider>
  );
  return (
    <html
      lang={currentLocale.language}
      suppressHydrationWarning
      // Seed the inline scroll-lock property to avoid WebKit invalidating the whole document.
      style={{ overflow: "auto" }}
    >
      <head>{head}</head>
      <body {...body} className={`${body.className} ${bodyClassName}`}>
        {Providers ? (
          <Providers locale={currentLocale.code}>{content}</Providers>
        ) : (
          <RootProvider
            search={{ enabled: false }}
            theme={{ defaultTheme: "system", enableSystem: true }}
          >
            {content}
          </RootProvider>
        )}
        {scripts}
      </body>
    </html>
  );
}
