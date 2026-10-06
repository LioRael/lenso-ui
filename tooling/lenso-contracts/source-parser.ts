import { parse } from "@babel/parser";
import path from "node:path";
import type { SourceFile, ThemeDeclaration, ThemeEditableToken } from "./types.ts";

type Node = Record<string, unknown>;
function record(value: unknown): Node | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Node)
    : undefined;
}
function walk(value: unknown, visit: (node: Node) => void): void {
  if (Array.isArray(value)) {
    value.forEach((child: unknown) => walk(child, visit));
    return;
  }
  const node = record(value);
  if (!node) return;
  visit(node);
  Object.values(node).forEach((child) => walk(child, visit));
}
function program(code: string): unknown {
  return parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    createImportExpressions: true,
  }).program;
}

/** Parse syntax only: never resolve packages or execute the included source. */
export function implementationImports(source: SourceFile): string[] {
  if (!/\.[cm]?[jt]sx?$/.test(source.file)) return [];
  const imports = new Set<string>();
  walk(program(source.code), (node) => {
    if (
      ![
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
        "ImportExpression",
        "TSImportType",
        "TSImportEqualsDeclaration",
      ].includes(String(node["type"]))
    )
      return;
    const imported = record(
      node["type"] === "TSImportType"
        ? node["argument"]
        : node["type"] === "TSImportEqualsDeclaration"
          ? record(node["moduleReference"])?.["expression"]
          : node["source"],
    );
    if (imported?.["type"] === "StringLiteral" && typeof imported["value"] === "string") {
      if (imported["value"].startsWith(".")) imports.add(imported["value"]);
    } else if (node["type"] === "ImportExpression") {
      throw new Error(
        `Implementation source graph requires a literal dynamic import: ${source.file}`,
      );
    }
  });
  return [...imports].sort();
}

/** One resolution order shared by on-disk production and included-file validation. */
export function implementationCandidates(file: string, specifier: string): string[] {
  if (specifier.includes("\\") || specifier.includes("\0"))
    throw new Error(`Invalid local implementation import: ${specifier}`);
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  if (!base.startsWith("packages/react/src/"))
    throw new Error(`Local implementation import outside packages/react/src/: ${specifier}`);
  const sourceBase = base.replace(/\.[cm]?jsx?$/, "");
  return [
    ...new Set([
      base,
      `${sourceBase}.tsx`,
      `${sourceBase}.ts`,
      `${sourceBase}.mts`,
      `${sourceBase}.cts`,
      `${base}.tsx`,
      `${base}.ts`,
      `${base}/index.tsx`,
      `${base}/index.ts`,
    ]),
  ];
}

/** Keep authored CSS values intact, including var fallbacks and multiline color mixes. */
export function themeDeclarations(source: SourceFile): ThemeDeclaration[] {
  const declarations: ThemeDeclaration[] = [];
  const scopes: string[] = [];
  let start = 0;
  let quote = "";
  let parentheses = 0;
  let comment = false;
  const text = source.code;
  const clean = (value: string): string => value.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  const declaration = (end: number): void => {
    const statement = clean(text.slice(start, end));
    const match = /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(statement);
    if (match) {
      if (!scopes.length) throw new Error(`Unscoped theme variable in ${source.file}`);
      declarations.push({
        file: source.file,
        scope: [...scopes],
        name: match[1]!,
        value: match[2]!.trim(),
      });
    }
  };
  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;
    if (comment) {
      if (char === "*" && text[index + 1] === "/") {
        comment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && text[index + 1] === "*") {
      comment = true;
      index++;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") parentheses++;
    if (char === ")") parentheses--;
    if (parentheses < 0) throw new Error(`Unbalanced theme CSS: ${source.file}`);
    if (parentheses) continue;
    if (char === "{") {
      scopes.push(clean(text.slice(start, index)));
      start = index + 1;
    } else if (char === ";") {
      declaration(index);
      start = index + 1;
    } else if (char === "}") {
      declaration(index);
      if (!scopes.pop()) throw new Error(`Unbalanced theme CSS: ${source.file}`);
      start = index + 1;
    }
  }
  if (scopes.length || parentheses || quote || comment)
    throw new Error(`Unbalanced theme CSS: ${source.file}`);
  return declarations;
}

// Recognize the authored static projection, not arbitrary JavaScript with a similar name.
const editorProjection = `Object.freeze(
  (Object.keys(categories) as ThemeToken[]).map((key) =>
    Object.freeze({
      key,
      label: key.replace(
        /(^|-)([a-z])/g,
        (_, separator: string, letter: string) => \`\${separator ? " " : ""}\${letter.toUpperCase()}\`,
      ),
      category: categories[key],
    }),
  ),
)`;
function syntax(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(syntax);
  const node = record(value);
  if (!node) return value;
  return Object.fromEntries(
    Object.entries(node)
      .filter(
        ([key]) =>
          ![
            "start",
            "end",
            "loc",
            "extra",
            "leadingComments",
            "trailingComments",
            "innerComments",
          ].includes(key),
      )
      .map(([key, child]) => [key, syntax(child)]),
  );
}
function initializer(code: string, name: string): Node {
  const found: Node[] = [];
  const body = record(program(code))?.["body"];
  if (!Array.isArray(body)) throw new Error("Invalid theme editor module");
  for (const item of body as unknown[]) {
    let declaration = record(item);
    if (declaration?.["type"] === "ExportNamedDeclaration")
      declaration = record(declaration["declaration"]);
    if (declaration?.["type"] !== "VariableDeclaration" || declaration["kind"] !== "const")
      continue;
    const declarations = declaration["declarations"];
    if (!Array.isArray(declarations)) continue;
    for (const value of declarations as unknown[]) {
      const node = record(value);
      if (record(node?.["id"])?.["name"] === name) {
        const init = record(node?.["init"]);
        if (init) found.push(init);
      }
    }
  }
  if (found.length !== 1) throw new Error(`Theme editor requires one static ${name} declaration`);
  return found[0]!;
}
function literalProperties(node: Node): Record<string, string> {
  const properties = node["properties"];
  if (node["type"] !== "ObjectExpression" || !Array.isArray(properties))
    throw new Error("Theme editor requires a static object");
  const result: Record<string, string> = {};
  for (const property of properties as unknown[]) {
    const prop = record(property);
    const key = record(prop?.["key"]);
    const value = record(prop?.["value"]);
    const name = key?.["type"] === "Identifier" ? key["name"] : key?.["value"];
    if (
      prop?.["type"] !== "ObjectProperty" ||
      prop["computed"] ||
      typeof name !== "string" ||
      value?.["type"] !== "StringLiteral" ||
      typeof value["value"] !== "string" ||
      Object.hasOwn(result, name)
    )
      throw new Error("Theme editor requires unique literal properties");
    Object.defineProperty(result, name, { value: value["value"], enumerable: true });
  }
  return result;
}
function category(value: string | undefined): ThemeEditableToken["category"] {
  if (value !== "color" && value !== "length" && value !== "font-family")
    throw new Error("Unsupported static theme editor category");
  return value;
}

/** Fail closed on unsupported editor code; labels are literals or the exact authored projection. */
export function themeEditableTokens(source: SourceFile): ThemeEditableToken[] {
  const tokens = initializer(source.code, "themeTokens");
  if (tokens["type"] === "ArrayExpression" && Array.isArray(tokens["elements"])) {
    return (tokens["elements"] as unknown[]).map((element) => {
      const node = record(element);
      if (!node) throw new Error("Theme editor requires literal tokens");
      const fields = literalProperties(node);
      if (
        Object.keys(fields).sort().join(",") !== "category,key,label" ||
        !fields["key"] ||
        !fields["label"]
      )
        throw new Error("Invalid static theme editor token");
      return { key: fields["key"], label: fields["label"], category: category(fields["category"]) };
    });
  }
  const expected = initializer(`const themeTokens = ${editorProjection}`, "themeTokens");
  if (JSON.stringify(syntax(tokens)) !== JSON.stringify(syntax(expected)))
    throw new Error(
      "Unsupported theme editor projection; cannot verify labels without executing code",
    );
  let categories = initializer(source.code, "categories");
  if (categories["type"] === "TSAsExpression") {
    const expression = record(categories["expression"]);
    if (!expression) throw new Error("Invalid theme editor categories");
    categories = expression;
  }
  return Object.entries(literalProperties(categories)).map(([key, value]) => ({
    key,
    label: key.replace(
      /(^|-)([a-z])/g,
      (_match, separator: string, letter: string) =>
        `${separator ? " " : ""}${letter.toUpperCase()}`,
    ),
    category: category(value),
  }));
}
