export { headingText } from "./heading-utils.mjs";
import { normalizeMetadata } from "./metadata.mjs";

function fail(message) {
  throw new Error(`Documentation source: ${message}`);
}

function text(value, name) {
  if (typeof value !== "string" || !value.trim()) fail(`${name} must be a non-empty string.`);
}

function route(value, name) {
  text(value, name);
  if (!value.startsWith("/") || value.startsWith("//") || /[\\?#\s]/u.test(value))
    fail(`${name} must be a local absolute path without query or fragment.`);
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    fail(`${name} has invalid escaping.`);
  }
  if (
    decoded.split("/").some((segment) => segment === "." || segment === "..") ||
    decoded.includes("\\")
  )
    fail(`${name} must not traverse directories.`);
}

/**
 * Index adapters supply product metadata and source reading; this module owns
 * locale identity, lookup, alternates and grouped navigation for every host.
 */
export function createDocumentationSource({
  pages,
  locales,
  readPage,
  canonicalSlug = (slug) => slug,
}) {
  if (!Array.isArray(pages) || !Array.isArray(locales) || !locales.length)
    fail("provide pages and at least one locale.");
  if (typeof readPage !== "function" || typeof canonicalSlug !== "function")
    fail("readPage and canonicalSlug must be functions.");
  const languages = new Map();
  for (const locale of locales) {
    for (const field of ["code", "label", "language"]) text(locale[field], `locale.${field}`);
    if (languages.has(locale.code)) fail(`duplicate locale "${locale.code}".`);
    languages.set(locale.code, Object.freeze({ ...locale }));
  }
  const identities = new Map();
  const translations = new Map();
  const urls = new Set();
  const snapshot = pages.map((input) => {
    if (!languages.has(input.locale)) fail(`unknown locale "${input.locale}".`);
    if (typeof input.slug !== "string") fail("page.slug must be a string.");
    text(input.title, "page.title");
    if (input.translationKey !== undefined) text(input.translationKey, "page.translationKey");
    route(`/${input.slug}`, "page.slug");
    route(input.url, "page.url");
    if (!["docs", "component", "api"].includes(input.kind ?? "docs"))
      fail(`unsupported page kind "${input.kind}".`);
    const key = `${input.locale}:${input.slug}`;
    let localePages = identities.get(input.locale);
    if (!localePages) {
      localePages = new Map();
      identities.set(input.locale, localePages);
    }
    if (localePages.has(input.slug)) fail(`duplicate page "${key}".`);
    const translationKey = input.translationKey ?? input.slug;
    let translatedPages = translations.get(translationKey);
    if (!translatedPages) {
      translatedPages = new Map();
      translations.set(translationKey, translatedPages);
    }
    if (translatedPages.has(input.locale))
      fail(`duplicate translation "${translationKey}" in "${input.locale}".`);
    if (urls.has(input.url)) fail(`duplicate URL "${input.url}".`);
    if (input.navigation?.order !== undefined && !Number.isFinite(input.navigation.order))
      fail(`invalid navigation order for "${key}".`);
    const page = Object.freeze({
      ...input,
      kind: input.kind ?? "docs",
      ...(input.metadata !== undefined ? { metadata: normalizeMetadata(input.metadata) } : {}),
      ...(input.navigation ? { navigation: Object.freeze({ ...input.navigation }) } : {}),
    });
    localePages.set(input.slug, page);
    translatedPages.set(input.locale, page);
    urls.add(input.url);
    return page;
  });
  const source = {
    pages: Object.freeze(snapshot),
    locales: Object.freeze([...languages.values()]),
    isLocale: (code) => languages.has(code),
    getPage: (locale, slug) => identities.get(locale)?.get(canonicalSlug(slug)),
    readPage,
    getAlternates(page) {
      return [...(translations.get(page.translationKey ?? page.slug)?.values() ?? [])].map(
        (candidate) => ({ ...languages.get(candidate.locale), url: candidate.url }),
      );
    },
    getNavigation(locale, collection) {
      if (!languages.has(locale)) fail(`unknown locale "${locale}".`);
      const selected = snapshot
        .filter(
          (page) =>
            page.locale === locale && (collection === undefined || page.collection === collection),
        )
        .toSorted((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
      const result = [];
      let group;
      for (const page of selected) {
        if (page.navigation?.group && page.navigation.group !== group) {
          group = page.navigation.group;
          result.push({ title: group });
        }
        result.push({
          title: page.title,
          url: page.url,
          ...(page.description !== undefined ? { description: page.description } : {}),
        });
      }
      return result;
    },
  };
  return Object.freeze(source);
}
