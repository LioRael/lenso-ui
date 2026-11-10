export type PageMetadata = {
  title?: string;
  description?: string;
  group?: string;
  nav?: boolean;
  search?: boolean;
  noindex?: boolean;
};

function mapping(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pageMetadata(value: unknown): PageMetadata {
  if (!mapping(value)) throw new Error("Page metadata must be a mapping");
  const metadata: PageMetadata = {};
  for (const key of ["title", "description", "group"] as const) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "string") throw new Error(`${key} must be a string`);
    metadata[key] = value[key];
  }
  for (const key of ["nav", "search", "noindex"] as const) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "boolean") throw new Error(`${key} must be a boolean`);
    metadata[key] = value[key];
  }
  return metadata;
}

export function frontmatter(source: string): { body: string; metadata: PageMetadata } {
  const normalized = source.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) return { body: source, metadata: {} };
  const end = /^---[ \t]*$/gm;
  end.lastIndex = 4;
  const match = end.exec(normalized);
  if (!match) throw new Error("Unclosed YAML frontmatter");
  const value: unknown = Bun.YAML.parse(normalized.slice(4, match.index));
  return {
    body: normalized.slice(match.index + match[0].length).replace(/^\n/, ""),
    metadata: pageMetadata(value ?? {}),
  };
}
