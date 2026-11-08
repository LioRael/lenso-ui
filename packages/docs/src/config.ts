import { access } from "node:fs/promises";
import path from "node:path";

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

const keys = new Set([
  "title",
  "description",
  "logo",
  "siteUrl",
  "basePath",
  "contentDir",
  "language",
  "navigation",
  "links",
  "components",
  "root",
  "source",
  "build",
  "aliases",
  "styles",
  "stylesheet",
  "trailingSlash",
  "locales",
  "defaultLocale",
]);
const reserved = new Set(["_lenso", "_next", "404"]);
let revision = 0;

function fail(message: string): never {
  throw new Error(`Docs config: ${message}`);
}

function text(value: string, field: string): string {
  if (typeof value !== "string" || !value.trim()) fail(`${field} must be a non-empty string.`);
  return value;
}

const projectRoots = new Set([".lenso", "out", ".git", "node_modules", "public"]);

function projectPath(value: string, field: string): string {
  text(value, field);
  if (
    path.isAbsolute(value) ||
    value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) < 32) ||
    value.split("/").some((part) => !part || part === "." || part === ".." || part.includes(":")) ||
    projectRoots.has(value.split("/")[0]!)
  )
    fail(
      `${field} must be a relative path inside the project, outside generated, dependency and public asset directories.`,
    );
  return value;
}

function modulePath(value: string, field: string, jsx = false): string {
  const file = projectPath(value, field);
  const extension = jsx ? /\.(?:[cm]?js|jsx|tsx|ts)$/u : /\.(?:mjs|js|ts)$/u;
  if (!extension.test(file)) fail(`${field} must name a supported JS/TS module.`);
  return file;
}

export function validatePageId(value: string, field = "page ID"): string {
  text(value, field);
  if (!value.split("/").every((segment) => /^[\p{L}\p{N}_-]+$/u.test(segment))) {
    fail(
      `${field} "${value}" must be a relative path without extensions, empty segments or traversal.`,
    );
  }
  if (reserved.has(value.split("/")[0]!))
    fail(`${field} "${value}" uses a reserved route (_lenso, _next, 404).`);
  return value;
}

function href(value: string, field: string): string {
  text(value, field);
  if (/[\s\\]/u.test(value) || [...value].some((character) => character.charCodeAt(0) < 32))
    fail(`${field} contains unsafe URL characters.`);
  if (value.startsWith("/") && !value.startsWith("//")) {
    const pathname = value.split(/[?#]/u)[0]!;
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      fail(`${field} contains invalid URL escaping.`);
    }
    if (
      decoded.includes("\\") ||
      decoded.startsWith("//") ||
      [...decoded].some((character) => character.charCodeAt(0) < 32) ||
      decoded.split("/").some((part) => part === "." || part === "..")
    )
      fail(`${field} contains an unsafe path.`);
    return value;
  }
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    if (["http:", "https:", "mailto:"].includes(url.protocol) && !url.username && !url.password)
      return value;
  } catch {
    /* Report a field-specific error below. */
  }
  fail(`${field} must be a root-relative URL, fragment, or safe http(s)/mailto URL.`);
}

export function defineDocs(input: DocsConfig): ResolvedDocsConfig {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(input))
  )
    fail("export a plain configuration object.");
  for (const key of Object.keys(input)) if (!keys.has(key)) fail(`unknown field "${key}".`);
  const config: ResolvedDocsConfig = {
    title: text(input.title, "title"),
    basePath: "",
    contentDir: "content",
    language: "en",
  };
  for (const field of ["description", "language"] as const) {
    if (input[field] !== undefined) config[field] = text(input[field], field);
  }
  if (input.contentDir !== undefined)
    config.contentDir = projectPath(input.contentDir, "contentDir");
  if (input.basePath !== undefined && input.basePath !== "") {
    text(input.basePath, "basePath");
    if (!input.basePath.startsWith("/"))
      fail('basePath must start with "/", for example "/manual".');
    validatePageId(input.basePath.slice(1), "basePath");
    config.basePath = input.basePath;
  }
  for (const field of ["components", "root"] as const) {
    if (input[field] !== undefined) config[field] = modulePath(input[field], field, true);
  }
  for (const field of ["source", "build"] as const) {
    if (input[field] !== undefined) config[field] = modulePath(input[field], field);
  }
  if (input.aliases !== undefined) {
    const aliases = input.aliases;
    if (
      !aliases ||
      typeof aliases !== "object" ||
      Array.isArray(aliases) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(aliases))
    )
      fail("aliases must be a plain record of module prefixes to project directories.");
    config.aliases = Object.fromEntries(
      Object.entries(aliases).map(([prefix, directory]) => {
        if (!/^[@A-Za-z0-9_-]+$/u.test(prefix))
          fail(`aliases.${prefix} must be a plain module prefix.`);
        return [prefix, projectPath(directory, `aliases.${prefix}`)];
      }),
    );
  }
  if (input.styles !== undefined) {
    if (!Array.isArray(input.styles)) fail("styles must be an array of relative CSS file paths.");
    const styles = input.styles.map((file, index) => {
      const value = projectPath(file, `styles[${index}]`);
      if (!value.endsWith(".css")) fail(`styles[${index}] must name a .css file.`);
      return value;
    });
    if (new Set(styles).size !== styles.length) fail("styles must not contain duplicate paths.");
    config.styles = styles;
  }
  if (input.stylesheet !== undefined) {
    if (!["framework", "consumer"].includes(input.stylesheet))
      fail('stylesheet must be "framework" or "consumer".');
    config.stylesheet = input.stylesheet;
  }
  if (input.trailingSlash !== undefined) {
    if (typeof input.trailingSlash !== "boolean") fail("trailingSlash must be a boolean.");
    config.trailingSlash = input.trailingSlash;
  }
  if (input.locales !== undefined) {
    if (!Array.isArray(input.locales) || input.locales.length === 0)
      fail("locales must be a non-empty array.");
    const codes = new Set();
    const prefixes = new Set();
    config.locales = input.locales.map((locale, index) => {
      const field = `locales[${index}]`;
      const allowed = ["code", "label", "language", "routePrefix", "contentDir"];
      if (
        !locale ||
        typeof locale !== "object" ||
        Array.isArray(locale) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(locale)) ||
        Object.keys(locale).some((key) => !allowed.includes(key))
      )
        fail(
          `${field} must contain only code, label, language, routePrefix and optional contentDir.`,
        );
      const code = text(locale.code, `${field}.code`);
      if (!/^[\p{L}\p{N}_-]+$/u.test(code)) fail(`${field}.code must be a URL-safe segment.`);
      if (codes.has(code)) fail(`locales contains duplicate code "${code}".`);
      codes.add(code);
      const routePrefix = text(locale.routePrefix, `${field}.routePrefix`);
      if (
        routePrefix !== "/" &&
        (!routePrefix.startsWith("/") ||
          routePrefix.startsWith("//") ||
          routePrefix.endsWith("/") ||
          routePrefix
            .split("/")
            .slice(1)
            .some((segment) => !/^[\p{L}\p{N}_-]+$/u.test(segment)))
      )
        fail(`${field}.routePrefix must be "/" or a rooted safe path without a trailing slash.`);
      if (prefixes.has(routePrefix))
        fail(`locales contains duplicate routePrefix "${routePrefix}".`);
      prefixes.add(routePrefix);
      const result: DocumentationLocale = {
        code,
        label: text(locale.label, `${field}.label`),
        language: text(locale.language, `${field}.language`),
        routePrefix,
      };
      if (locale.contentDir !== undefined)
        result.contentDir = projectPath(locale.contentDir, `${field}.contentDir`);
      return result;
    });
  }
  if (input.defaultLocale !== undefined) {
    const code = text(input.defaultLocale, "defaultLocale");
    if (!config.locales?.some((locale) => locale.code === code))
      fail("defaultLocale must match a registered locale code.");
    config.defaultLocale = code;
  }
  if (input.logo !== undefined) {
    config.logo = href(input.logo, "logo");
    if (!input.logo.startsWith("/") && !input.logo.startsWith("https://"))
      fail("logo must be root-relative or https.");
  }
  if (input.siteUrl !== undefined) {
    config.siteUrl = href(input.siteUrl, "siteUrl");
    if (!/^https?:\/\//u.test(config.siteUrl)) fail("siteUrl must be an absolute http(s) URL.");
  }
  if (input.navigation !== undefined) {
    if (!Array.isArray(input.navigation))
      fail("navigation must be an array of {title, pages} groups.");
    config.navigation = input.navigation.map((group, index) => {
      if (
        !group ||
        typeof group !== "object" ||
        Array.isArray(group) ||
        Object.keys(group).some((key) => !["title", "pages"].includes(key))
      )
        fail(`navigation[${index}] must contain only title and pages.`);
      if (!Array.isArray(group.pages)) fail(`navigation[${index}].pages must be an array.`);
      return {
        title: text(group.title, `navigation[${index}].title`),
        pages: group.pages.map((id) => validatePageId(id, `navigation[${index}].pages`)),
      };
    });
  }
  if (input.links !== undefined) {
    if (
      !input.links ||
      typeof input.links !== "object" ||
      Array.isArray(input.links) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(input.links))
    )
      fail("links must be a record of labels and safe URLs.");
    config.links = Object.fromEntries(
      Object.entries(input.links).map(([label, url]) => [
        text(label, "link label"),
        href(url, `links.${label}`),
      ]),
    );
  }
  return config;
}

export async function loadConfig(root: string): Promise<ResolvedDocsConfig> {
  const found: string[] = [];
  for (const name of ["docs.config.ts", "docs.config.mjs"]) {
    const file = path.resolve(root, name);
    try {
      await access(file);
      found.push(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  if (found.length > 1) fail("keep only one of docs.config.ts and docs.config.mjs.");
  if (!found.length) return defineDocs({ title: "Documentation" });
  try {
    const module = await import(`${found[0]}?revision=${++revision}`);
    return defineDocs(module.default);
  } catch (error) {
    throw new Error(`${found[0]}: ${error instanceof Error ? error.message : error}`, {
      cause: error,
    });
  }
}
