import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

function fail(message) {
  throw new Error(`Docs config: ${message}`);
}

function text(value, field) {
  if (typeof value !== "string" || !value.trim()) fail(`${field} must be a non-empty string.`);
  return value;
}

const projectRoots = new Set([".lenso", "out", ".git", "node_modules", "public"]);

function projectDirectory(value, field) {
  text(value, field);
  if (
    path.isAbsolute(value) ||
    value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) < 32) ||
    value.split("/").some((part) => !part || part === "." || part === ".." || part.includes(":")) ||
    projectRoots.has(value.split("/")[0])
  )
    fail(
      `${field} must be a relative directory inside the project, outside generated, dependency and public asset directories.`,
    );
  return value;
}

function modulePath(value, field) {
  text(value, field);
  if (
    path.isAbsolute(value) ||
    value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) < 32) ||
    value.split("/").some((part) => !part || part === "." || part === ".." || part.includes(":")) ||
    !/\.(?:mjs|js|ts)$/u.test(value) ||
    projectRoots.has(value.split("/")[0])
  )
    fail(`${field} must name a relative .mjs, .js or .ts module inside the project.`);
  return value;
}

export function validatePageId(value, field = "page ID") {
  text(value, field);
  if (!value.split("/").every((segment) => /^[\p{L}\p{N}_-]+$/u.test(segment))) {
    fail(
      `${field} "${value}" must be a relative path without extensions, empty segments or traversal.`,
    );
  }
  if (reserved.has(value.split("/")[0]))
    fail(`${field} "${value}" uses a reserved route (_lenso, _next, 404).`);
  return value;
}

function href(value, field) {
  text(value, field);
  if (/[\s\\]/u.test(value) || [...value].some((character) => character.charCodeAt(0) < 32))
    fail(`${field} contains unsafe URL characters.`);
  if (value.startsWith("/") && !value.startsWith("//")) {
    const pathname = value.split(/[?#]/u)[0];
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

export function defineDocs(input) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(input))
  )
    fail("export a plain configuration object.");
  for (const key of Object.keys(input)) if (!keys.has(key)) fail(`unknown field "${key}".`);
  const config = {
    title: text(input.title, "title"),
    basePath: "",
    contentDir: "content",
    language: "en",
  };
  for (const field of ["description", "language"]) {
    if (input[field] !== undefined) config[field] = text(input[field], field);
  }
  if (input.contentDir !== undefined) {
    text(input.contentDir, "contentDir");
    if (
      path.isAbsolute(input.contentDir) ||
      input.contentDir.includes("\\") ||
      [...input.contentDir].some((character) => character.charCodeAt(0) < 32) ||
      input.contentDir
        .split("/")
        .some((part) => !part || part === "." || part === ".." || part.includes(":"))
    ) {
      fail('contentDir must be a relative directory inside the project, for example "content".');
    }
    if (
      [".lenso", "out", "node_modules", ".git", "public"].includes(input.contentDir.split("/")[0])
    )
      fail("contentDir must not use generated, dependency or public asset directories.");
    config.contentDir = input.contentDir;
  }
  if (input.basePath !== undefined && input.basePath !== "") {
    text(input.basePath, "basePath");
    if (!input.basePath.startsWith("/"))
      fail('basePath must start with "/", for example "/manual".');
    validatePageId(input.basePath.slice(1), "basePath");
    config.basePath = input.basePath;
  }
  for (const field of ["components", "root"]) {
    if (input[field] === undefined) continue;
    const file = text(input[field], field);
    if (
      path.isAbsolute(file) ||
      file.includes("\\") ||
      [...file].some((character) => character.charCodeAt(0) < 32) ||
      file
        .split("/")
        .some((part) => !part || part === "." || part === ".." || part.includes(":")) ||
      !/\.(?:[cm]?js|jsx|tsx|ts)$/u.test(file) ||
      [".lenso", "out", "node_modules", ".git", "public"].includes(file.split("/")[0])
    )
      fail(`${field} must name a relative JS/TS module inside the project.`);
    config[field] = file;
  }
  for (const field of ["source", "build"]) {
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
        return [prefix, projectDirectory(directory, `aliases.${prefix}`)];
      }),
    );
  }
  if (input.styles !== undefined) {
    if (!Array.isArray(input.styles)) fail("styles must be an array of relative CSS file paths.");
    const styles = input.styles.map((file, index) => {
      text(file, `styles[${index}]`);
      if (
        path.isAbsolute(file) ||
        file.includes("\\") ||
        [...file].some((character) => character.charCodeAt(0) < 32) ||
        file
          .split("/")
          .some((part) => !part || part === "." || part === ".." || part.includes(":")) ||
        !file.endsWith(".css") ||
        projectRoots.has(file.split("/")[0])
      )
        fail(`styles[${index}] must be a relative .css file inside the project.`);
      return file;
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
      const result = {
        code,
        label: text(locale.label, `${field}.label`),
        language: text(locale.language, `${field}.language`),
        routePrefix,
      };
      if (locale.contentDir !== undefined)
        result.contentDir = projectDirectory(locale.contentDir, `${field}.contentDir`);
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

export async function loadConfig(root) {
  const found = [];
  for (const name of ["docs.config.ts", "docs.config.mjs"]) {
    const file = path.resolve(root, name);
    try {
      await access(file);
      found.push(file);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (found.length > 1) fail("keep only one of docs.config.ts and docs.config.mjs.");
  if (!found.length) return defineDocs({ title: "Documentation" });
  const url = pathToFileURL(found[0]);
  url.searchParams.set("revision", String(++revision));
  try {
    const module = await import(url.href);
    return defineDocs(module.default);
  } catch (error) {
    throw new Error(`${found[0]}: ${error.message}`, { cause: error });
  }
}
