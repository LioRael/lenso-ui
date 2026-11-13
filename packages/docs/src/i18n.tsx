"use client";

import { createContext, useContext, type ReactNode } from "react";
import { I18nProvider as FumadocsI18nProvider } from "fumadocs-ui/contexts/i18n";
import { I18nProvider } from "@lenso/ui";
import type { DocumentationLocale } from "./document-model";
import { getDocumentationMessages, resolveDocumentationLocale } from "./language";

const DocumentationLocaleContext = createContext<DocumentationLocale>(
  resolveDocumentationLocale("en"),
);

export function DocumentationI18nProvider({
  locale,
  locales = [locale],
  children,
}: {
  locale: DocumentationLocale;
  locales?: readonly DocumentationLocale[];
  children: ReactNode;
}) {
  const messages = getDocumentationMessages(locale.language);
  return (
    <DocumentationLocaleContext value={locale}>
      <FumadocsI18nProvider
        locale={locale.code}
        locales={locales.map(({ code, label }) => ({ locale: code, name: label }))}
        translations={{
          "Previous Page(pagination)": messages.previousPage,
          "Next Page(pagination)": messages.nextPage,
          "Search(search dialog)": messages.search.trigger,
          "Close Search(search dialog)(aria-label)": messages.search.close,
          "Copy Anchor Link(heading anchor)(aria-label)": messages.copyAnchor,
          "Copied Anchor Link(heading anchor)(aria-label)": messages.copiedAnchor,
        }}
      >
        <I18nProvider locale={locale.language}>{children}</I18nProvider>
      </FumadocsI18nProvider>
    </DocumentationLocaleContext>
  );
}

export function useDocumentationMessages(code?: string) {
  const locale = useContext(DocumentationLocaleContext);
  return getDocumentationMessages(!code || code === locale.code ? locale.language : code);
}
