"use client";

import { ThemeProvider } from "next-themes";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { DocumentationI18nProvider, resolveDocumentationLocale } from "@lenso/docs/client";
import { documentationLocales } from "../lib/locale";
import { useSyncExternalStore, type ReactNode } from "react";
import { DocsDesignThemeProvider } from "./docs-design-theme";
export { ThemeToggle as ThemeSelector } from "./fumadocs/ui/theme-toggle";

function subscribeDirection(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
  return () => observer.disconnect();
}

function getDirection() {
  return document.documentElement.dir === "rtl" ? ("rtl" as const) : ("ltr" as const);
}

export function Providers({ children, locale }: { children: ReactNode; locale: "en" | "cn" }) {
  const direction = useSyncExternalStore(subscribeDirection, getDirection, () => "ltr" as const);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RootProvider dir={direction} theme={{ enabled: false }} search={{ enabled: false }}>
        <DocumentationI18nProvider
          locale={resolveDocumentationLocale(locale, documentationLocales)}
          locales={documentationLocales}
        >
          <div dir={direction} style={{ display: "contents" }}>
            <DocsDesignThemeProvider>{children}</DocsDesignThemeProvider>
          </div>
        </DocumentationI18nProvider>
      </RootProvider>
    </ThemeProvider>
  );
}
