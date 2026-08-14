export type JsonObject = Record<string, unknown>;
export type JsonDocumentMap = Record<string, JsonObject>;

export interface ReferenceObject {
  $ref: string;
}

export interface ResolverSet {
  sources: Array<ReferenceObject | JsonObject>;
}

export interface ResolverModifier {
  default?: string;
  contexts: Record<string, Array<ReferenceObject | JsonObject>>;
}

export interface ResolverDocument {
  version: "2025.10";
  sets?: Record<string, ResolverSet>;
  modifiers?: Record<string, ResolverModifier>;
  resolutionOrder: Array<ReferenceObject>;
}

export interface CompileOptions {
  publicRoots: string[];
  requiredSemanticPaths: string[];
}

export interface ResolvedToken {
  cssName: string;
  cssValue: string;
  path: string;
  type: string;
  value: unknown;
}

export interface ResolvedTokenIR {
  contexts: Record<string, Record<string, ResolvedToken>>;
  defaultContext: string;
  semanticPaths: string[];
}

interface TokenNode extends JsonObject {
  $type: string;
  $value: unknown;
}

const tokenNamePattern = /^[^${}.][^{}.]*$/;
const aliasPattern = /^\{([^{}]+)\}$/;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isToken(value: unknown): value is TokenNode {
  return isObject(value) && typeof value.$type === "string" && Object.hasOwn(value, "$value");
}

function dictionary<T>(): Record<string, T> {
  return Object.create(null) as Record<string, T>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function mergeDocuments(base: JsonObject, overlay: JsonObject): JsonObject {
  const result = dictionary<unknown>();
  for (const [key, value] of Object.entries(base)) result[key] = clone(value);
  for (const [key, value] of Object.entries(overlay)) {
    if (key.startsWith("$")) {
      result[key] = clone(value);
      continue;
    }
    if (!tokenNamePattern.test(key)) {
      throw new Error(`Invalid DTCG token or group name: ${key}`);
    }
    const current = result[key];
    result[key] =
      isObject(current) && isObject(value) && !isToken(current) && !isToken(value)
        ? mergeDocuments(current, value)
        : clone(value);
  }
  return result;
}

function sourceDocument(source: ReferenceObject | JsonObject, files: JsonDocumentMap): JsonObject {
  if ("$ref" in source) {
    if (typeof source.$ref !== "string" || source.$ref.startsWith("#")) {
      throw new Error(`Unsupported token source reference: ${String(source.$ref)}`);
    }
    const document = Object.hasOwn(files, source.$ref) ? files[source.$ref] : undefined;
    if (!document) throw new Error(`Missing token source: ${source.$ref}`);
    return document;
  }
  return source;
}

function mergeSources(
  sources: Array<ReferenceObject | JsonObject>,
  files: JsonDocumentMap,
): JsonObject {
  return sources.reduce<JsonObject>(
    (result, source) => mergeDocuments(result, sourceDocument(source, files)),
    {},
  );
}

function flattenTokens(
  document: JsonObject,
  path: string[] = [],
  inheritedType?: string,
  result: Record<string, TokenNode> = dictionary<TokenNode>(),
): Record<string, TokenNode> {
  const groupType = typeof document.$type === "string" ? document.$type : inheritedType;

  for (const [name, value] of Object.entries(document)) {
    if (name.startsWith("$")) continue;
    if (!tokenNamePattern.test(name)) {
      throw new Error(`Invalid DTCG token or group name: ${name}`);
    }
    const tokenPath = [...path, name];
    if (isToken(value)) {
      result[tokenPath.join(".")] = value;
      continue;
    }
    if (isObject(value) && Object.hasOwn(value, "$value")) {
      if (!groupType) {
        throw new Error(`Token ${tokenPath.join(".")} has no $type`);
      }
      result[tokenPath.join(".")] = {
        ...value,
        $type: groupType,
        $value: value.$value,
      };
      continue;
    }
    if (!isObject(value)) {
      throw new Error(`Invalid DTCG group at ${tokenPath.join(".")}`);
    }
    flattenTokens(value, tokenPath, groupType, result);
  }
  return result;
}

function resolveTokenGraph(tokens: Record<string, TokenNode>): Record<string, TokenNode> {
  const resolved = dictionary<TokenNode>();
  const resolving = new Set<string>();

  const visit = (path: string): TokenNode => {
    const cached = resolved[path];
    if (cached) return cached;
    const token = tokens[path];
    if (!token) throw new Error(`Missing token reference: ${path}`);
    if (resolving.has(path)) {
      throw new Error(`Token alias cycle detected at ${path}`);
    }
    resolving.add(path);
    const match = typeof token.$value === "string" && token.$value.match(aliasPattern);
    if (match) {
      const targetPath = match[1]!;
      const target = visit(targetPath);
      if (target.$type !== token.$type) {
        throw new Error(
          `Token type mismatch: ${path} (${token.$type}) references ${targetPath} (${target.$type})`,
        );
      }
      resolved[path] = { ...token, $value: clone(target.$value) };
    } else {
      resolved[path] = clone(token);
    }
    resolving.delete(path);
    return resolved[path];
  };

  for (const path of Object.keys(tokens).sort()) visit(path);
  return resolved;
}

function byteToHex(value: number): string {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

function cssValue(type: string, value: unknown): string {
  if (type === "color") {
    if (!isObject(value) || value.colorSpace !== "srgb") {
      throw new Error("The MVP color subset requires an sRGB DTCG color value");
    }
    const components = value.components;
    if (
      !Array.isArray(components) ||
      components.length !== 3 ||
      !components.every((component) => typeof component === "number")
    ) {
      throw new Error("Invalid sRGB color components");
    }
    const alpha = value.alpha ?? 1;
    if (typeof alpha !== "number") throw new Error("Invalid sRGB alpha");
    const hex = components.map(byteToHex).join("");
    return alpha === 1 ? `#${hex}` : `#${hex}${byteToHex(alpha)}`;
  }
  if (type === "dimension" || type === "duration") {
    if (!isObject(value) || typeof value.value !== "number" || typeof value.unit !== "string") {
      throw new Error(`Invalid ${type} value`);
    }
    return `${value.value}${value.unit}`;
  }
  if (type === "number" || type === "fontWeight") {
    if (typeof value !== "number") throw new Error(`Invalid ${type} value`);
    return String(value);
  }
  if (type === "fontFamily") {
    const genericFamilies = new Set([
      "cursive",
      "fantasy",
      "math",
      "monospace",
      "sans-serif",
      "serif",
      "system-ui",
      "ui-monospace",
      "ui-rounded",
      "ui-sans-serif",
      "ui-serif",
    ]);
    const family = (name: string) => (genericFamilies.has(name) ? name : JSON.stringify(name));
    if (typeof value === "string") return family(value);
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      return value.map(family).join(", ");
    }
    throw new Error("Invalid fontFamily value");
  }
  throw new Error(`Unsupported MVP token type: ${type}`);
}

function cssName(path: string): string {
  const name = `--${path}`
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[._\s]+/g, "-")
    .toLowerCase();
  if (!/^--[a-z0-9-]+$/.test(name)) {
    throw new Error(`Cannot create CSS custom property for ${path}`);
  }
  return name;
}

function tokenKey(path: string): string {
  return path.replace(/[._-]+([a-zA-Z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

export function publicTokenPaths(document: JsonObject, publicRoots: string[]): string[] {
  return Object.keys(flattenTokens(document))
    .filter((path) => publicRoots.some((root) => path === root || path.startsWith(`${root}.`)))
    .sort();
}

function referenceName(reference: ReferenceObject, kind: "sets" | "modifiers"): string {
  const prefix = `#/${kind}/`;
  if (!reference.$ref.startsWith(prefix)) {
    throw new Error(`Expected a same-document ${kind} reference, received ${reference.$ref}`);
  }
  return reference.$ref.slice(prefix.length);
}

export function compileResolver(
  resolver: ResolverDocument,
  files: JsonDocumentMap,
  options: CompileOptions,
): ResolvedTokenIR {
  if (resolver.version !== "2025.10") {
    throw new Error(`Unsupported DTCG resolver version: ${String(resolver.version)}`);
  }
  const modifierEntries = Object.entries(resolver.modifiers ?? {});
  if (modifierEntries.length !== 1) {
    throw new Error("The MVP resolver subset requires exactly one theme modifier");
  }
  const modifierEntry = modifierEntries[0];
  if (!modifierEntry) {
    throw new Error("The MVP resolver subset requires a theme modifier");
  }
  const [modifierName, modifier] = modifierEntry;
  if (!modifier.default || !modifier.contexts[modifier.default]) {
    throw new Error(`Modifier ${modifierName} requires a valid default context`);
  }

  let baseDocument: JsonObject = {};
  let encounteredModifier = false;
  for (const entry of resolver.resolutionOrder) {
    if (entry.$ref.startsWith("#/sets/")) {
      if (encounteredModifier) {
        throw new Error("The MVP resolver subset requires all sets before the modifier");
      }
      const setName = referenceName(entry, "sets");
      const set = resolver.sets?.[setName];
      if (!set) throw new Error(`Missing resolver set: ${setName}`);
      baseDocument = mergeDocuments(baseDocument, mergeSources(set.sources, files));
      continue;
    }
    const currentModifierName = referenceName(entry, "modifiers");
    if (currentModifierName !== modifierName) {
      throw new Error(`Unknown resolver modifier: ${currentModifierName}`);
    }
    encounteredModifier = true;
  }
  if (!encounteredModifier) {
    throw new Error(`Resolution order does not include modifier ${modifierName}`);
  }

  const contexts = dictionary<Record<string, ResolvedToken>>();
  const outputNames = new Map<string, string>();
  for (const [contextName, sources] of Object.entries(modifier.contexts).sort()) {
    const contextDocument = mergeSources(sources, files);
    const contextTokens = flattenTokens(contextDocument);
    for (const path of options.requiredSemanticPaths) {
      if (!contextTokens[path]) {
        throw new Error(`Theme ${contextName} is missing semantic token ${path}`);
      }
    }

    const merged = mergeDocuments(baseDocument, contextDocument);
    const resolved = resolveTokenGraph(flattenTokens(merged));
    const publicTokens = dictionary<ResolvedToken>();
    for (const path of Object.keys(resolved).sort()) {
      if (!options.publicRoots.some((root) => path === root || path.startsWith(`${root}.`))) {
        continue;
      }
      const token = resolved[path];
      if (!token) throw new Error(`Resolved token disappeared: ${path}`);
      const name = cssName(path);
      const existingPath = outputNames.get(name);
      if (existingPath && existingPath !== path) {
        throw new Error(`CSS output-name collision: ${existingPath} and ${path}`);
      }
      outputNames.set(name, path);
      publicTokens[path] = {
        path,
        type: token.$type,
        value: clone(token.$value),
        cssName: name,
        cssValue: cssValue(token.$type, token.$value),
      };
    }
    contexts[contextName] = publicTokens;
  }

  const defaultContext = contexts[modifier.default];
  if (!defaultContext) throw new Error(`Missing resolved context: ${modifier.default}`);
  const semanticPaths = Object.keys(defaultContext).sort();
  for (const [contextName, context] of Object.entries(contexts)) {
    const paths = Object.keys(context).sort();
    if (JSON.stringify(paths) !== JSON.stringify(semanticPaths)) {
      throw new Error(`Theme ${contextName} does not implement the complete semantic contract`);
    }
  }

  return { contexts, defaultContext: modifier.default, semanticPaths };
}

function declarations(tokens: Record<string, ResolvedToken>, indent: string): string {
  return Object.values(tokens)
    .sort((a, b) => a.cssName.localeCompare(b.cssName))
    .map((token) => `${indent}${token.cssName}: ${token.cssValue};`)
    .join("\n");
}

export interface RenderedTokenArtifacts {
  adapter: string;
  contractJson: string;
  css: string;
  dtcgJson: string;
  figmaManifestJson: string;
  stylex: string;
  typescript: string;
}

export function renderTokenArtifacts(ir: ResolvedTokenIR): RenderedTokenArtifacts {
  const orderedContexts = Object.fromEntries(
    Object.entries(ir.contexts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, tokens]) => [name, Object.fromEntries(Object.entries(tokens).sort())]),
  );
  const defaultTokens = ir.contexts[ir.defaultContext];
  if (!defaultTokens) throw new Error(`Missing default theme: ${ir.defaultContext}`);
  const css = [
    `:root, [data-theme="${ir.defaultContext}"] {`,
    declarations(defaultTokens, "  "),
    "}",
    ...Object.entries(ir.contexts)
      .filter(([name]) => name !== ir.defaultContext)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([name, tokens]) => [
        "",
        `[data-theme="${name}"] {`,
        declarations(tokens, "  "),
        "}",
      ]),
    "",
  ].join("\n");
  const stylex = [
    'import * as stylex from "@stylexjs/stylex";',
    "",
    // Constants deliberately inline each public CSS variable reference into the
    // consuming atomic rule. defineVars would declare a second custom property
    // on :root, where nested theme values are resolved too early.
    "export const tokens = stylex.defineConsts({",
    ...ir.semanticPaths.map((path) => {
      const token = defaultTokens[path]!;
      return `  ${tokenKey(path)}: ${JSON.stringify(`var(${token.cssName}, ${token.cssValue})`)},`;
    }),
    "});",
    "",
  ].join("\n");
  const typescript = [
    "export const semanticTokenNames = {",
    ...ir.semanticPaths.map(
      (path) => `  ${JSON.stringify(path)}: ${JSON.stringify(defaultTokens[path]!.cssName)},`,
    ),
    "} as const;",
    "",
    "export type SemanticToken = keyof typeof semanticTokenNames;",
    `export type ThemeName = ${Object.keys(ir.contexts)
      .sort()
      .map((name) => JSON.stringify(name))
      .join(" | ")};`,
    "",
    "export const themes = " +
      JSON.stringify(
        Object.fromEntries(
          Object.entries(ir.contexts).map(([name, tokens]) => [
            name,
            Object.fromEntries(
              Object.entries(tokens).map(([path, token]) => [path, token.cssValue]),
            ),
          ]),
        ),
        null,
        2,
      ) +
      " as const;",
    "",
  ].join("\n");
  const contract = {
    specification: "DTCG 2025.10",
    defaultContext: ir.defaultContext,
    semanticPaths: ir.semanticPaths,
    contexts: orderedContexts,
  };
  const dtcgDocument: JsonObject = {
    $schema: "https://www.designtokens.org/schemas/2025.10/format.json",
  };
  for (const path of ir.semanticPaths) {
    const segments = path.split(".");
    let parent = dtcgDocument;
    for (const segment of segments.slice(0, -1)) {
      const child = parent[segment];
      if (!isObject(child)) parent[segment] = {};
      parent = parent[segment] as JsonObject;
    }
    const token = defaultTokens[path];
    if (!token) throw new Error(`Missing default token: ${path}`);
    parent[segments.at(-1)!] = { $type: token.type, $value: token.value };
  }
  const adapter = [
    "// Generated copyable adapter for Consumer-owned theme values.",
    'import type { CSSProperties } from "react";',
    'import { semanticTokenNames, type SemanticToken } from "@lenso/tokens";',
    "",
    "export function lensoTheme(values: Record<SemanticToken, string>): CSSProperties {",
    "  return Object.fromEntries(",
    "    Object.entries(values).map(([path, value]) => [semanticTokenNames[path as SemanticToken], value]),",
    "  ) as CSSProperties;",
    "}",
    "",
  ].join("\n");
  return {
    css,
    stylex,
    typescript,
    adapter,
    contractJson: `${JSON.stringify(contract, null, 2)}\n`,
    dtcgJson: `${JSON.stringify(dtcgDocument, null, 2)}\n`,
    figmaManifestJson: `${JSON.stringify(
      {
        collection: "Color",
        modes: Object.keys(ir.contexts).sort(),
        variables: ir.semanticPaths.map((path) => ({
          path,
          cssName: defaultTokens[path]!.cssName,
          type: defaultTokens[path]!.type,
        })),
      },
      null,
      2,
    )}\n`,
  };
}
