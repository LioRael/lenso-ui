export type DocumentationKind = "docs" | "component" | "api";

export interface DocumentationLocale {
  code: string;
  label: string;
  language: string;
}

export interface DocumentationDocument {
  id: string;
  slug: string;
  url: string;
  locale: string;
  title: string;
  description?: string;
  kind?: DocumentationKind;
  metadata?: Readonly<Record<string, unknown>>;
  markdown: string;
}

export interface DocumentationHeading {
  title: string;
  id: string;
  depth: number;
}
