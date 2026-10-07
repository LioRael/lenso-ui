import type { DocumentationKind, DocumentationLocale } from "./document-model.js";
export { headingText } from "./heading-utils.mjs";

export interface DocumentationPageMetadata {
  slug: string;
  url: string;
  locale: string;
  title: string;
  description?: string;
  kind?: DocumentationKind;
  collection?: string;
  translationKey?: string;
  metadata?: Readonly<Record<string, unknown>>;
  navigation?: { group?: string; order?: number };
}

export interface DocumentationSource<Page extends DocumentationPageMetadata> {
  readonly pages: readonly Page[];
  readonly locales: readonly DocumentationLocale[];
  isLocale(code: string): boolean;
  getPage(locale: string, slug: string): Page | undefined;
  readPage(page: Page): Promise<string>;
  getAlternates(page: Page): (DocumentationLocale & { url: string })[];
  getNavigation(
    locale: string,
    collection?: string,
  ): {
    title: string;
    url?: string;
    description?: string;
  }[];
}

export function createDocumentationSource<Page extends DocumentationPageMetadata>(options: {
  pages: readonly Page[];
  locales: readonly DocumentationLocale[];
  readPage(page: NoInfer<Page>): Promise<string>;
  canonicalSlug?(slug: string): string;
}): DocumentationSource<Page>;
