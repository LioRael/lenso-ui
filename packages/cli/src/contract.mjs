import { readFileSync } from "node:fs";
import {
  validateContract,
  resolveDoc,
  resolveExample,
  resolveStyle,
} from "../../../tooling/lenso-contracts/index.mjs";

export function readContract(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

export function validateToolContract(input) {
  if (input?.formatVersion !== 2)
    throw new Error("Unsupported Lenso contract format; developer tools require format 2.");
  return validateContract(input);
}

export function createQueries(input) {
  const contract = validateToolContract(input);
  const families = Object.entries(contract.api.families);
  const metadata = () => ({
    formatVersion: contract.formatVersion,
    lensoVersion: contract.lensoVersion,
    packageVersions: contract.packageVersions,
    digest: contract.digest,
    compatibility: contract.compatibility,
  });
  const locale = (value = "en") => {
    if (!["en", "cn"].includes(value)) throw new Error(`Unsupported locale: ${value}`);
    return value;
  };
  const family = (name) => {
    const match = families.find(
      ([slug, details]) => slug === name || details.parts.some((part) => part.name === name),
    );
    if (!match) throw new Error(`Unknown component: ${name}. Use list for canonical names.`);
    return match;
  };
  const documentation = (name, language = "en") => {
    locale(language);
    const direct = contract.docs.find((doc) => doc.slug === name && doc.locale === language);
    if (direct) return resolveDoc(contract, direct);
    const [slug] = family(name);
    const doc = contract.docs.find(
      (entry) => entry.locale === language && entry.slug.split("/").at(-1) === slug,
    );
    if (!doc) throw new Error(`No authored documentation for ${name} in ${language}`);
    return resolveDoc(contract, doc);
  };
  return {
    metadata,
    list: () =>
      families.map(([slug, details]) => ({
        slug,
        parts: details.parts.map((part) => part.name),
        native: [...new Set(details.parts.flatMap((part) => part.native))],
      })),
    api: (name) => {
      const [slug, details] = family(name);
      return {
        slug,
        ...details,
        parts: details.parts.map((part) => ({
          ...part,
          properties: part.properties.map((id) => ({ id, ...contract.api.properties[id] })),
        })),
      };
    },
    documentation,
    examples: (name, language = "en") => {
      locale(language);
      const [slug] = family(name);
      return contract.examples
        .filter(
          (example) =>
            example.locale === language &&
            (example.file.startsWith(`${slug}/`) ||
              example.file.startsWith(`${language}/${slug}/`)),
        )
        .map((example) => resolveExample(contract, example));
    },
    styles: (name) => {
      const [slug] = family(name);
      const styles = (contract.styles ?? []).filter((style) => style.family === slug);
      if (!styles.length)
        throw new Error(`No StyleX source is included for ${slug} in this contract`);
      return styles.map((style) => resolveStyle(contract, style));
    },
    search: (query, language = "en", limit = 10) => {
      locale(language);
      if (typeof query !== "string" || !query.trim() || query.length > 200)
        throw new Error("Search must be 1–200 characters");
      if (!Number.isInteger(limit) || limit < 1 || limit > 50)
        throw new Error("Search limit must be 1–50");
      const needle = query.toLocaleLowerCase();
      const results = [];
      for (const doc of contract.docs) {
        if (doc.locale !== language) continue;
        const matches =
          `${doc.title}\n${doc.description}`.toLocaleLowerCase().includes(needle) ||
          resolveDoc(contract, doc).markdown.toLocaleLowerCase().includes(needle);
        if (!matches) continue;
        const { locale, slug, title, description } = doc;
        results.push({ locale, slug, title, description });
        if (results.length === limit) break;
      }
      return results;
    },
  };
}
