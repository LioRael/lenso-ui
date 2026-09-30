export const upstream = Object.freeze({
  repository: "https://github.com/heroui-inc/heroui",
  commit: "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e",
  version: "3.2.6",
  locales: ["en", "cn"],
});

export function pageSlug(file) {
  return file
    .replace(/^content\/docs\/(?:en|cn)\//, "")
    .replace(/\.mdx$/, "")
    .split("/")
    .filter((part) => !part.startsWith("(") && part !== "index")
    .join("/");
}

export function adaptContent(source) {
  return source
    .replace(/@heroui\/react(?![\w-])/g, "@lenso/ui")
    .replace(/@heroui\/styles(?![\w-])/g, "@lenso/tokens")
    .replace(
      /^import\s+.*?\s+from\s+["']@\/components\/(?:color-section|pr-contributors)["'];?\s*$/gm,
      "",
    )
    .replace(/^import\s+\{HandPointUp\}\s+from\s+["']@gravity-ui\/icons["'];?\s*$/gm, "");
}
