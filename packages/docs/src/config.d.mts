export interface DocsNavigationGroup {
  title: string;
  pages: string[];
}
export interface DocumentationLocale {
  code: string;
  label: string;
  language: string;
  routePrefix: string;
  contentDir?: string;
}
export interface DocsConfig {
  title: string;
  description?: string;
  logo?: string;
  siteUrl?: string;
  basePath?: string;
  contentDir?: string;
  language?: string;
  navigation?: DocsNavigationGroup[];
  links?: Record<string, string>;
  components?: string;
  /** Contained customization module for locale roots; otherwise components supplies getRootOptions. */
  root?: string;
  source?: string;
  build?: string;
  aliases?: Record<string, string>;
  styles?: string[];
  stylesheet?: "framework" | "consumer";
  trailingSlash?: boolean;
  locales?: DocumentationLocale[];
  defaultLocale?: string;
}
export interface ResolvedDocsConfig extends DocsConfig {
  basePath: string;
  contentDir: string;
  language: string;
}
export function defineDocs(config: DocsConfig): ResolvedDocsConfig;
export function loadConfig(root: string): Promise<ResolvedDocsConfig>;
export function validatePageId(value: string, field?: string): string;
