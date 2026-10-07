import type { DocsConfig } from "./config.mjs";
import type { DocumentationPageMetadata } from "./source.mjs";
import type { DocumentationLocale } from "./document-model.js";

export type HostPage = DocumentationPageMetadata & {
  id: string;
  markdown: string;
  /** Contained server-render module imported only by this document's exact route. */
  module?: string;
  compiled?: string;
  headings?: { title: string; id: string; depth: number }[];
  structuredData?: {
    headings: { id: string; content: string }[];
    contents: { heading?: string; content: string }[];
  };
};

export interface HostRoute {
  path: string;
  module: string;
  locale?: string;
  props?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface HostRedirect {
  from: string;
  to: string;
  permanent?: boolean;
}

export interface HostSource {
  render?: "mdx" | "custom";
  pages: HostPage[];
  routes?: HostRoute[];
  redirects?: HostRedirect[];
  watchPaths?: string[];
  search?: Record<string, string>;
}

export interface SourceModule {
  prepare?(context: {
    root: string;
    config: DocsConfig;
    command: "dev" | "build";
  }): void | Promise<void>;
  loadSource(context: { root: string; config: DocsConfig }): HostSource | Promise<HostSource>;
}

export function routePath(value: string, basePath?: string): string;
export function localPath(
  root: string,
  relative: string,
  options?: { directory?: boolean | null },
): Promise<string>;
export function modulePath(root: string, relative: string, extensions?: RegExp): Promise<string>;
export function loadHost(
  root: string,
  config: DocsConfig,
  command: "dev" | "build",
): Promise<{
  pages: HostPage[];
  locales: DocumentationLocale[];
  defaultLocale: string;
  routes: HostRoute[];
  redirects: HostRedirect[];
  watchPaths: string[];
  searchFiles: Record<string, string>;
}>;
