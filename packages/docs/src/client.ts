"use client";

export {
  DocumentationSiteLayout,
  type DocumentationSiteLayoutProps,
  type DocumentationSection,
  type DocumentationNavigationItem,
} from "./site-layout";
export {
  DocumentationSearch,
  DocumentationCompactSearchTrigger,
  useDocumentationSearchTrigger,
  type DocumentationSearchProps,
} from "./search";

export { DocsHeaderBackdrop } from "./header-backdrop";
export { DocumentationPageActions } from "./page-actions";
export { DocumentationI18nProvider, useDocumentationMessages } from "./i18n";
export { DocumentationLanguageToggle } from "./language-toggle";
export { getDocumentationMessages, resolveDocumentationLocale } from "./language";
