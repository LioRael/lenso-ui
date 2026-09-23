import { glob, readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import * as ts from "typescript";

export type Severity = "error" | "warning";
export type ValidImport = string | { from: string; as: string };
export type LiteralValue = string | number;

export interface TokenFamilyConfig {
  tokenPrefixes: string[];
  properties: string[];
  allowLiterals?: LiteralValue[];
}

export interface ComponentContract {
  source: string;
  export: string;
  ownedXstyleProperties: string[];
  allowedXstyleProperties: string[];
  guidance: string;
}

export interface DesignLintConfig {
  adapter: "stylex";
  files?: string[];
  stylex?: {
    validImports?: ValidImport[];
  };
  tokens: {
    source: string | string[];
    imports: string[];
    families: Record<string, TokenFamilyConfig>;
  };
  components?: ComponentContract[];
  unresolved?: "ignore" | "warn";
}

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  path: string;
  line: number;
  column: number;
  message: string;
}

export interface Skipped {
  path: string;
  line: number;
  column: number;
  reason: string;
}

export interface LintResult {
  diagnostics: Diagnostic[];
  skipped: Skipped[];
}

export interface LintOptions {
  configDir?: string;
}

export interface RunDesignLintOptions {
  config: string | DesignLintConfig;
  files?: string[];
  cwd?: string;
}

interface TokenRecord {
  path: string;
  type: string;
  cssValue: string;
}

interface TokenUniverse {
  records: TokenRecord[];
  byKey: Map<string, string>;
}

interface StyleDefinition {
  name: string;
  node?: ts.ObjectLiteralExpression;
  dynamic: boolean;
}

type StyleNamespace = Map<string, StyleDefinition>;

interface TokenBinding {
  kind: "namespace" | "object" | "direct";
  importedName?: string;
}

interface FileBindings {
  stylexNamespaces: Set<string>;
  createBindings: Set<string>;
  tokenBindings: Map<string, TokenBinding>;
  componentBindings: Map<string, ComponentContract>;
  staticValues: Map<string, ts.Expression>;
  shadowedScopes: Array<{ name: string; scope: ts.Node }>;
  styleNamespaces: Map<string, StyleNamespace>;
  namespacesByCall: Map<ts.CallExpression, StyleNamespace>;
}

interface ResolvedValue {
  kind: "literal" | "token";
  node: ts.Expression;
  value?: LiteralValue;
  tokenPath?: string;
}

interface StyleReference {
  definition: StyleDefinition;
  expression: ts.Expression;
}

interface ResolvedXstyle {
  references: StyleReference[];
  unresolved: boolean;
}

const DEFAULT_STYLEX_IMPORTS: ValidImport[] = ["stylex", "@stylexjs/stylex"];
const SOURCE_GLOB = "**/*.{ts,tsx,js,jsx,mjs,cjs}";
const IGNORED_PATH_PARTS = new Set([".git", "node_modules", "dist", ".next", "out", "coverage"]);
const CSS_VALUE_UNITS =
  "(?:px|rem|em|ex|ch|vw|vh|vmin|vmax|svh|svw|lvh|lvw|dvh|dvw|cm|mm|in|pt|pc|q|%)";
const CSS_COLOR_NAMES = new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkmagenta",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
]);

const isSourceFile = (path: string): boolean =>
  /\.(?:ts|tsx|js|jsx|mjs|cjs)$/u.test(path) &&
  !path.split(/[\\/]/u).some((part) => IGNORED_PATH_PARTS.has(part));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isLiteralValue = (value: unknown): value is LiteralValue =>
  typeof value === "string" || (typeof value === "number" && Number.isFinite(value));

const getNodePosition = (
  sourceFile: ts.SourceFile,
  node: ts.Node,
): { line: number; column: number } => {
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return { line: line.line + 1, column: line.character + 1 };
};

const getPropertyName = (name: ts.PropertyName | undefined): string | undefined => {
  if (name === undefined) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
    return name.text;
  return undefined;
};

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }
  return current;
};

const getLiteral = (expression: ts.Expression): LiteralValue | undefined => {
  const value = unwrapExpression(expression);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (
    ts.isPrefixUnaryExpression(value) &&
    (value.operator === ts.SyntaxKind.MinusToken || value.operator === ts.SyntaxKind.PlusToken) &&
    ts.isNumericLiteral(value.operand)
  ) {
    const number = Number(value.operand.text);
    return value.operator === ts.SyntaxKind.MinusToken ? -number : number;
  }
  return undefined;
};

const isBooleanLiteral = (expression: ts.Expression, expected: boolean): boolean =>
  (expression.kind === ts.SyntaxKind.TrueKeyword && expected) ||
  (expression.kind === ts.SyntaxKind.FalseKeyword && !expected);

const styleXKey = (path: string): string => {
  const parts = path.split(".");
  return parts
    .map((part, index) => {
      if (index === 0) return part;
      return /^\d+$/u.test(part) ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`;
    })
    .join("");
};

const toColorHex = (value: Record<string, unknown>): string | undefined => {
  const components = value.components;
  if (value.colorSpace !== "srgb" || !Array.isArray(components) || components.length < 3)
    return undefined;
  if (!components.slice(0, 3).every((component) => typeof component === "number")) return undefined;
  const channels = components.slice(0, 3).map((component) => {
    const channel = Math.max(0, Math.min(1, component as number));
    return Math.round(channel * 255)
      .toString(16)
      .padStart(2, "0");
  });
  const alpha = typeof value.alpha === "number" ? value.alpha : 1;
  const alphaHex =
    alpha < 1
      ? Math.round(Math.max(0, Math.min(1, alpha)) * 255)
          .toString(16)
          .padStart(2, "0")
      : "";
  return `#${channels.join("")}${alphaHex}`;
};

const toCssValue = (value: unknown): string | undefined => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!isRecord(value)) return undefined;
  if (typeof value.value === "number" && typeof value.unit === "string") {
    return `${value.value}${value.unit}`;
  }
  return toColorHex(value);
};

const addTokenRecord = (
  records: Map<string, TokenRecord>,
  path: string,
  value: unknown,
  type?: string,
): void => {
  const cssValue = toCssValue(value);
  if (!cssValue || records.has(path)) return;
  records.set(path, { path, type: type ?? "unknown", cssValue });
};

const readJson = async (path: string): Promise<unknown> => {
  const contents = await readFile(path, "utf8");
  return JSON.parse(contents) as unknown;
};

const loadTokenRecords = async (paths: string[], configDir: string): Promise<TokenUniverse> => {
  const records = new Map<string, TokenRecord>();
  for (const source of paths) {
    const data = await readJson(resolve(configDir, source));
    if (!isRecord(data)) throw new Error(`Token source "${source}" must contain a JSON object.`);

    const contexts = isRecord(data.contexts) ? data.contexts : undefined;
    if (contexts) {
      const defaultContext =
        typeof data.defaultContext === "string" && isRecord(contexts[data.defaultContext])
          ? data.defaultContext
          : Object.keys(contexts).sort()[0];
      if (defaultContext) {
        const context = contexts[defaultContext];
        if (isRecord(context)) {
          for (const [key, item] of Object.entries(context)) {
            if (isRecord(item)) {
              addTokenRecord(
                records,
                typeof item.path === "string" ? item.path : key,
                item.cssValue ?? item.value,
                typeof item.type === "string" ? item.type : undefined,
              );
            }
          }
        }
      }
      if (isRecord(data.primitives)) {
        for (const [key, item] of Object.entries(data.primitives)) {
          if (isRecord(item)) {
            addTokenRecord(
              records,
              typeof item.path === "string" ? item.path : key,
              item.cssValue ?? item.value,
              typeof item.type === "string" ? item.type : undefined,
            );
          }
        }
      }
      continue;
    }

    const visitDtcg = (
      value: Record<string, unknown>,
      prefix: string,
      inheritedType?: string,
    ): void => {
      const type = typeof value.$type === "string" ? value.$type : inheritedType;
      if ("$value" in value) {
        addTokenRecord(records, prefix, value.$value, type);
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        if (key.startsWith("$") || !isRecord(child)) continue;
        visitDtcg(child, prefix ? `${prefix}.${key}` : key, type);
      }
    };
    visitDtcg(data, "");
  }

  const sorted = [...records.values()].sort((left, right) => left.path.localeCompare(right.path));
  const byKey = new Map<string, string>();
  for (const record of sorted) {
    const key = styleXKey(record.path);
    if (!byKey.has(key)) byKey.set(key, record.path);
  }
  return { records: sorted, byKey };
};

const validateKeys = (value: Record<string, unknown>, allowed: string[], path: string): void => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      throw new Error(`Unsupported design-lint config key "${path}.${key}".`);
  }
};

const validateConfig = (value: DesignLintConfig): DesignLintConfig => {
  if (!isRecord(value)) throw new Error("Design-lint config must be an object.");
  validateKeys(
    value,
    ["$schema", "adapter", "files", "stylex", "tokens", "components", "unresolved"],
    "config",
  );
  if (value.adapter !== "stylex") throw new Error('Only the "stylex" adapter is supported.');
  if (value.files !== undefined && !isStringArray(value.files))
    throw new Error('Config key "files" must be an array of glob strings.');
  if (
    value.unresolved !== undefined &&
    value.unresolved !== "ignore" &&
    value.unresolved !== "warn"
  ) {
    throw new Error('Config key "unresolved" must be "ignore" or "warn".');
  }

  const stylex = value.stylex;
  if (stylex !== undefined) {
    if (!isRecord(stylex)) throw new Error('Config key "stylex" must be an object.');
    validateKeys(stylex, ["validImports"], "config.stylex");
    if (!Array.isArray(stylex.validImports))
      throw new Error('Config key "stylex.validImports" must be an array.');
    for (const item of stylex.validImports) {
      if (typeof item === "string") continue;
      if (!isRecord(item) || typeof item.from !== "string" || typeof item.as !== "string") {
        throw new Error(
          'Each "stylex.validImports" entry must be a module string or { from, as }.',
        );
      }
    }
  }

  if (!isRecord(value.tokens)) throw new Error('Config key "tokens" must be an object.');
  validateKeys(value.tokens, ["source", "imports", "families"], "config.tokens");
  if (!(typeof value.tokens.source === "string" || isStringArray(value.tokens.source))) {
    throw new Error('Config key "tokens.source" must be a path or an array of paths.');
  }
  if (!isStringArray(value.tokens.imports))
    throw new Error('Config key "tokens.imports" must be an array.');
  if (!isRecord(value.tokens.families))
    throw new Error('Config key "tokens.families" must be an object.');
  for (const [familyName, familyValue] of Object.entries(value.tokens.families)) {
    if (!isRecord(familyValue)) throw new Error(`Config family "${familyName}" must be an object.`);
    validateKeys(
      familyValue,
      ["tokenPrefixes", "properties", "allowLiterals"],
      `config.tokens.families.${familyName}`,
    );
    if (!isStringArray(familyValue.tokenPrefixes) || !isStringArray(familyValue.properties)) {
      throw new Error(`Config family "${familyName}" needs tokenPrefixes and properties arrays.`);
    }
    if (
      familyValue.allowLiterals !== undefined &&
      (!Array.isArray(familyValue.allowLiterals) ||
        !familyValue.allowLiterals.every(isLiteralValue))
    ) {
      throw new Error(
        `Config family "${familyName}".allowLiterals must contain only strings or numbers.`,
      );
    }
  }

  if (value.components !== undefined) {
    if (!Array.isArray(value.components))
      throw new Error('Config key "components" must be an array.');
    for (const [index, component] of value.components.entries()) {
      if (!isRecord(component))
        throw new Error(`Config component at index ${index} must be an object.`);
      validateKeys(
        component,
        ["source", "export", "ownedXstyleProperties", "allowedXstyleProperties", "guidance"],
        `config.components[${index}]`,
      );
      if (
        typeof component.source !== "string" ||
        typeof component.export !== "string" ||
        !isStringArray(component.ownedXstyleProperties) ||
        !isStringArray(component.allowedXstyleProperties) ||
        typeof component.guidance !== "string"
      ) {
        throw new Error(
          `Config component at index ${index} is missing a valid ownership contract.`,
        );
      }
    }
  }
  return value;
};

export const defineConfig = (config: DesignLintConfig): DesignLintConfig => validateConfig(config);

export async function resolveFilePatterns(patterns: string[], cwd: string): Promise<string[]> {
  const matches = new Set<string>();
  for (const pattern of patterns) {
    const direct = resolve(cwd, pattern);
    try {
      const info = await stat(direct);
      if (info.isFile() && isSourceFile(direct)) {
        matches.add(direct);
        continue;
      }
      if (info.isDirectory()) {
        const nestedPattern = `${pattern.replace(/[\\/]$/u, "")}/${SOURCE_GLOB}`;
        for await (const match of glob(nestedPattern, { cwd })) {
          const absolute = resolve(cwd, match);
          if (isSourceFile(absolute) && (await stat(absolute)).isFile()) matches.add(absolute);
        }
        continue;
      }
    } catch {
      // Treat paths that do not exist as glob patterns.
    }
    for await (const match of glob(pattern, { cwd })) {
      const absolute = resolve(cwd, match);
      if (isSourceFile(absolute) && (await stat(absolute)).isFile()) matches.add(absolute);
    }
  }
  return [...matches].sort();
}

export async function loadConfig(path: string): Promise<DesignLintConfig> {
  const absolutePath = resolve(path);
  const value =
    extname(absolutePath).toLowerCase() === ".json"
      ? await readJson(absolutePath)
      : ((await import(pathToFileURL(absolutePath).href)) as { default?: unknown }).default;
  if (!value) throw new Error(`Config "${path}" must export a default object.`);
  return validateConfig(value as DesignLintConfig);
}

const getAllowedStylexModules = (config: DesignLintConfig): Set<string> =>
  new Set(
    (config.stylex?.validImports ?? DEFAULT_STYLEX_IMPORTS).map((item) =>
      typeof item === "string" ? item : item.from,
    ),
  );

const getNamedStylexAliases = (config: DesignLintConfig): Map<string, string> =>
  new Map(
    (config.stylex?.validImports ?? DEFAULT_STYLEX_IMPORTS)
      .filter((item): item is { from: string; as: string } => typeof item !== "string")
      .map((item) => [item.from, item.as]),
  );

const getComponentContract = (
  components: ComponentContract[] | undefined,
  source: string,
  exported: string,
): ComponentContract | undefined =>
  components?.find((component) => component.source === source && component.export === exported);

const isShadowedAt = (name: string, node: ts.Node, bindings: FileBindings): boolean => {
  let current: ts.Node | undefined = node;
  while (current) {
    if (bindings.shadowedScopes.some((item) => item.name === name && item.scope === current)) {
      return true;
    }
    current = current.parent;
  }
  return false;
};

const isStylexCreateCall = (
  expression: ts.Expression,
  bindings: FileBindings,
): expression is ts.CallExpression => {
  if (!ts.isCallExpression(expression)) return false;
  const callee = unwrapExpression(expression.expression);
  if (ts.isIdentifier(callee)) {
    return bindings.createBindings.has(callee.text) && !isShadowedAt(callee.text, callee, bindings);
  }
  return (
    ts.isPropertyAccessExpression(callee) &&
    callee.name.text === "create" &&
    ts.isIdentifier(callee.expression) &&
    bindings.stylexNamespaces.has(callee.expression.text) &&
    !isShadowedAt(callee.expression.text, callee.expression, bindings)
  );
};

const getMemberChain = (expression: ts.Expression): string[] | undefined => {
  const value = unwrapExpression(expression);
  if (ts.isIdentifier(value)) return [value.text];
  if (ts.isPropertyAccessExpression(value)) {
    const parent = getMemberChain(value.expression);
    return parent ? [...parent, value.name.text] : undefined;
  }
  if (ts.isElementAccessExpression(value) && value.argumentExpression) {
    const parent = getMemberChain(value.expression);
    const key = getLiteral(value.argumentExpression);
    return parent && typeof key === "string" ? [...parent, key] : undefined;
  }
  return undefined;
};

const resolveTokenPath = (
  expression: ts.Expression,
  bindings: FileBindings,
  tokens: TokenUniverse,
): string | undefined => {
  const chain = getMemberChain(expression);
  if (!chain) return undefined;
  const binding = bindings.tokenBindings.get(chain[0]!);
  if (!binding) return undefined;
  if (isShadowedAt(chain[0]!, expression, bindings)) return undefined;

  if (binding.kind === "direct") return tokens.byKey.get(binding.importedName ?? "");
  if (binding.kind === "object") return tokens.byKey.get(chain[1] ?? "");

  const objectIndex = chain.findIndex((item) => item === "tokens" || item === "primitiveTokens");
  return tokens.byKey.get(chain[objectIndex >= 0 ? objectIndex + 1 : 1] ?? "");
};

const bindingNames = (name: ts.BindingName): string[] => {
  if (ts.isIdentifier(name)) return [name.text];
  const names: string[] = [];
  for (const element of name.elements) {
    if (ts.isBindingElement(element)) names.push(...bindingNames(element.name));
  }
  return names;
};

const enclosingScope = (node: ts.Node, functionScoped = false): ts.Node | undefined => {
  let scope: ts.Node | undefined = node.parent;
  while (
    scope &&
    !ts.isSourceFile(scope) &&
    (functionScoped ? !ts.isFunctionLike(scope) : !ts.isBlock(scope) && !ts.isFunctionLike(scope))
  ) {
    scope = scope.parent;
  }
  return scope && !ts.isSourceFile(scope) ? scope : undefined;
};

const getVariableDeclarations = (
  sourceFile: ts.SourceFile,
): {
  values: Map<string, ts.Expression>;
  shadowedScopes: Array<{ name: string; scope: ts.Node }>;
} => {
  const values = new Map<string, ts.Expression>();
  const shadowedScopes: Array<{ name: string; scope: ts.Node }> = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        values.set(declaration.name.text, declaration.initializer);
      }
    }
  }
  const visit = (node: ts.Node): void => {
    const addScopedNames = (
      name: ts.BindingName | undefined,
      declaration: ts.Node,
      functionScoped = false,
    ): void => {
      const scope = enclosingScope(declaration, functionScoped);
      if (scope) {
        for (const binding of name ? bindingNames(name) : []) {
          shadowedScopes.push({ name: binding, scope });
        }
      }
    };
    if (ts.isVariableDeclaration(node)) {
      const isVar =
        ts.isVariableDeclarationList(node.parent) &&
        (node.parent.flags & ts.NodeFlags.BlockScoped) === 0;
      addScopedNames(node.name, node, isVar);
    }
    if (ts.isParameter(node)) {
      addScopedNames(node.name, node);
    }
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      addScopedNames(node.name, node);
    }
    if (ts.isFunctionExpression(node) || ts.isClassExpression(node)) {
      if (node.name) shadowedScopes.push({ name: node.name.text, scope: node });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { values, shadowedScopes };
};

const collectImports = (
  sourceFile: ts.SourceFile,
  config: DesignLintConfig,
  tokens: TokenUniverse,
): FileBindings => {
  const declarations = getVariableDeclarations(sourceFile);
  const bindings: FileBindings = {
    stylexNamespaces: new Set(),
    createBindings: new Set(),
    tokenBindings: new Map(),
    componentBindings: new Map(),
    staticValues: declarations.values,
    shadowedScopes: declarations.shadowedScopes,
    styleNamespaces: new Map(),
    namespacesByCall: new Map(),
  };
  const stylexModules = getAllowedStylexModules(config);
  const namedStylexAliases = getNamedStylexAliases(config);
  const tokenModules = new Set(config.tokens.imports);

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const source = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) continue;

    if (stylexModules.has(source)) {
      if (clause.name) bindings.stylexNamespaces.add(clause.name.text);
      if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        bindings.stylexNamespaces.add(clause.namedBindings.name.text);
      }
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          const imported = element.propertyName?.text ?? element.name.text;
          if (imported === "create" || namedStylexAliases.get(source) === element.name.text) {
            bindings.createBindings.add(element.name.text);
          }
        }
      }
    }

    if (tokenModules.has(source)) {
      if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        bindings.tokenBindings.set(clause.namedBindings.name.text, { kind: "namespace" });
      }
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          const imported = element.propertyName?.text ?? element.name.text;
          if (imported === "tokens" || imported === "primitiveTokens") {
            bindings.tokenBindings.set(element.name.text, { kind: "object" });
          } else if (tokens.byKey.has(imported)) {
            bindings.tokenBindings.set(element.name.text, {
              kind: "direct",
              importedName: imported,
            });
          }
        }
      }
    }

    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        const exported = element.propertyName?.text ?? element.name.text;
        const component = getComponentContract(config.components, source, exported);
        if (component) bindings.componentBindings.set(element.name.text, component);
      }
    }
  }
  return bindings;
};

const getCreateDefinitions = (
  call: ts.CallExpression,
  bindings: FileBindings,
): StyleNamespace | undefined => {
  const argument = call.arguments[0];
  if (!argument || !ts.isObjectLiteralExpression(argument)) return undefined;
  const definitions: StyleNamespace = new Map();
  for (const property of argument.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = getPropertyName(property.name);
    if (!name) continue;
    const initializer = unwrapExpression(property.initializer);
    if (ts.isObjectLiteralExpression(initializer)) {
      definitions.set(name, { name, node: initializer, dynamic: false });
    } else if (ts.isArrowFunction(initializer)) {
      definitions.set(name, { name, dynamic: true });
    } else {
      definitions.set(name, { name, dynamic: true });
    }
  }
  bindings.namespacesByCall.set(call, definitions);
  return definitions;
};

const collectStyleNamespaces = (sourceFile: ts.SourceFile, bindings: FileBindings): void => {
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isStylexCreateCall(node, bindings)) {
      getCreateDefinitions(node, bindings);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  for (const [name, initializer] of bindings.staticValues) {
    const value = unwrapExpression(initializer);
    if (ts.isCallExpression(value) && bindings.namespacesByCall.has(value)) {
      bindings.styleNamespaces.set(name, bindings.namespacesByCall.get(value)!);
    }
  }

  const resolving = new Set<string>();
  const resolveNamespace = (name: string): StyleNamespace | undefined => {
    const direct = bindings.styleNamespaces.get(name);
    if (direct) return direct;
    if (resolving.has(name)) return undefined;
    resolving.add(name);
    const initializer = bindings.staticValues.get(name);
    const value = initializer && unwrapExpression(initializer);
    const alias = value && ts.isIdentifier(value) ? resolveNamespace(value.text) : undefined;
    if (alias) bindings.styleNamespaces.set(name, alias);
    resolving.delete(name);
    return alias;
  };
  for (const name of bindings.staticValues.keys()) resolveNamespace(name);
};

const isSelectorKey = (key: string): boolean =>
  key.startsWith(":") || key.startsWith("@") || key.startsWith("[");

const familyForProperty = (
  families: Record<string, TokenFamilyConfig>,
  property: string,
): [string, TokenFamilyConfig] | undefined => {
  for (const entry of Object.entries(families)) {
    if (entry[1].properties.includes(property)) return entry;
  }
  return undefined;
};

const parseHexColor = (value: string): [number, number, number, number] | undefined => {
  const match = /^#([0-9a-f]+)$/iu.exec(value);
  if (!match) return undefined;
  const hex = match[1]!;
  if (![3, 4, 6, 8].includes(hex.length)) return undefined;
  const channels =
    hex.length <= 4
      ? [...hex].map((channel) => Number.parseInt(`${channel}${channel}`, 16))
      : hex.match(/../gu)?.map((channel) => Number.parseInt(channel, 16));
  if (!channels || channels.length < 3) return undefined;
  return [channels[0]!, channels[1]!, channels[2]!, channels[3] ?? 255];
};

const parseColor = (value: string): [number, number, number, number] | undefined => {
  const hex = parseHexColor(value);
  if (hex) return hex;
  const rgb = /^rgba?\(([^)]+)\)$/iu.exec(value);
  if (rgb) {
    const parts = rgb[1]!.split(/[\s,/]+/u).filter(Boolean);
    if (parts.length < 3) return undefined;
    const channels = parts
      .slice(0, 3)
      .map((part) =>
        part.endsWith("%") ? Number.parseFloat(part) * 2.55 : Number.parseFloat(part),
      );
    const alpha =
      parts[3] === undefined
        ? 255
        : parts[3].endsWith("%")
          ? Number.parseFloat(parts[3]) * 2.55
          : Number.parseFloat(parts[3]) * 255;
    if (channels.some((channel) => !Number.isFinite(channel)) || !Number.isFinite(alpha))
      return undefined;
    return [channels[0]!, channels[1]!, channels[2]!, alpha];
  }
  const named = value.toLowerCase();
  const common: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    blue: [0, 0, 255],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    red: [255, 0, 0],
    transparent: [0, 0, 0],
    white: [255, 255, 255],
    yellow: [255, 255, 0],
  };
  const channels = common[named];
  return channels ? [...channels, named === "transparent" ? 0 : 255] : undefined;
};

const parseDimension = (value: LiteralValue): { number: number; unit: string } | undefined => {
  if (typeof value === "number") return { number: value, unit: "px" };
  const match = new RegExp(`^(-?(?:\\d+|\\d*\\.\\d+))(${CSS_VALUE_UNITS})?$`, "u").exec(
    value.trim(),
  );
  if (!match) return undefined;
  return { number: Number(match[1]), unit: match[2] ?? "px" };
};

const isColorLiteral = (value: string): boolean =>
  /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu.test(value) ||
  /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(/iu.test(value) ||
  value.toLowerCase() === "transparent" ||
  value.toLowerCase() === "currentcolor" ||
  CSS_COLOR_NAMES.has(value.toLowerCase());

const literalAllowed = (family: TokenFamilyConfig, value: LiteralValue): boolean =>
  family.allowLiterals?.some((allowed) => allowed === value || String(allowed) === String(value)) ??
  false;

const nearestTokens = (
  familyName: string,
  family: TokenFamilyConfig,
  value: LiteralValue,
  universe: TokenUniverse,
): TokenRecord[] => {
  const candidates = universe.records.filter((record) =>
    family.tokenPrefixes.some((prefix) => record.path.startsWith(prefix)),
  );
  if (familyName.toLowerCase().includes("color") && typeof value === "string") {
    const target = parseColor(value);
    if (!target) return [];
    return candidates
      .flatMap((record) => {
        const candidate = parseColor(record.cssValue);
        if (!candidate) return [];
        const distance = Math.sqrt(
          target.reduce((sum, channel, index) => sum + (channel - candidate[index]!) ** 2, 0),
        );
        return [{ record, distance }];
      })
      .sort(
        (left, right) =>
          left.distance - right.distance || left.record.path.localeCompare(right.record.path),
      )
      .slice(0, 3)
      .map((item) => item.record);
  }

  const target = parseDimension(value);
  if (!target) return [];
  return candidates
    .flatMap((record) => {
      const candidate = parseDimension(record.cssValue);
      if (!candidate || candidate.unit !== target.unit) return [];
      return [{ record, distance: Math.abs(candidate.number - target.number) }];
    })
    .sort(
      (left, right) =>
        left.distance - right.distance || left.record.path.localeCompare(right.record.path),
    )
    .slice(0, 3)
    .map((item) => item.record);
};

const formatCandidates = (candidates: TokenRecord[]): string =>
  candidates.map((candidate) => `${candidate.path} (${candidate.cssValue})`).join(", ");

const resolveStaticValues = (
  expression: ts.Expression,
  bindings: FileBindings,
  universe: TokenUniverse,
  seen = new Set<string>(),
): ResolvedValue[] => {
  const value = unwrapExpression(expression);
  const literal = getLiteral(value);
  if (literal !== undefined) return [{ kind: "literal", node: value, value: literal }];

  const tokenPath = resolveTokenPath(value, bindings, universe);
  if (tokenPath) return [{ kind: "token", node: value, tokenPath }];

  if (ts.isIdentifier(value)) {
    if (isShadowedAt(value.text, value, bindings)) return [];
    if (seen.has(value.text)) return [];
    const initializer = bindings.staticValues.get(value.text);
    if (!initializer) return [];
    const nextSeen = new Set(seen);
    nextSeen.add(value.text);
    return resolveStaticValues(initializer, bindings, universe, nextSeen);
  }

  if (ts.isConditionalExpression(value)) {
    return [
      ...resolveStaticValues(value.whenTrue, bindings, universe, seen),
      ...resolveStaticValues(value.whenFalse, bindings, universe, seen),
    ];
  }

  if (ts.isBinaryExpression(value)) {
    if (value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      if (isBooleanLiteral(value.left, false)) return [];
      return resolveStaticValues(value.right, bindings, universe, seen);
    }
    if (
      value.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      return [
        ...resolveStaticValues(value.left, bindings, universe, seen),
        ...resolveStaticValues(value.right, bindings, universe, seen),
      ];
    }
  }
  return [];
};

const isIgnorableStyleValue = (expression: ts.Expression): boolean => {
  const value = unwrapExpression(expression);
  return (
    value.kind === ts.SyntaxKind.NullKeyword ||
    value.kind === ts.SyntaxKind.TrueKeyword ||
    value.kind === ts.SyntaxKind.FalseKeyword ||
    (ts.isIdentifier(value) && value.text === "undefined")
  );
};

const hasUnresolvedStaticValue = (
  expression: ts.Expression,
  bindings: FileBindings,
  universe: TokenUniverse,
  seen = new Set<string>(),
): boolean => {
  const value = unwrapExpression(expression);
  if (getLiteral(value) !== undefined || resolveTokenPath(value, bindings, universe)) return false;
  if (isIgnorableStyleValue(value)) return false;

  if (ts.isIdentifier(value)) {
    if (isShadowedAt(value.text, value, bindings) || seen.has(value.text)) return true;
    const initializer = bindings.staticValues.get(value.text);
    if (!initializer) return true;
    const nextSeen = new Set(seen);
    nextSeen.add(value.text);
    return hasUnresolvedStaticValue(initializer, bindings, universe, nextSeen);
  }
  if (ts.isConditionalExpression(value)) {
    return (
      hasUnresolvedStaticValue(value.whenTrue, bindings, universe, seen) ||
      hasUnresolvedStaticValue(value.whenFalse, bindings, universe, seen)
    );
  }
  if (ts.isBinaryExpression(value)) {
    if (value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      if (isBooleanLiteral(value.left, false)) return false;
      return hasUnresolvedStaticValue(value.right, bindings, universe, seen);
    }
    if (
      value.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      return (
        hasUnresolvedStaticValue(value.left, bindings, universe, seen) ||
        hasUnresolvedStaticValue(value.right, bindings, universe, seen)
      );
    }
  }
  return true;
};

const createDiagnostic = (
  sourceFile: ts.SourceFile,
  node: ts.Node,
  ruleId: string,
  message: string,
): Diagnostic => ({
  ruleId,
  severity: "error",
  path: sourceFile.fileName,
  ...getNodePosition(sourceFile, node),
  message,
});

const createSkipped = (sourceFile: ts.SourceFile, node: ts.Node, reason: string): Skipped => ({
  path: sourceFile.fileName,
  ...getNodePosition(sourceFile, node),
  reason,
});

const checkStyleValue = (
  sourceFile: ts.SourceFile,
  node: ts.Expression,
  property: string,
  config: DesignLintConfig,
  bindings: FileBindings,
  universe: TokenUniverse,
  diagnostics: Diagnostic[],
): void => {
  const familyEntry = familyForProperty(config.tokens.families, property);
  if (!familyEntry) return;
  const [familyName, family] = familyEntry;
  const values = resolveStaticValues(node, bindings, universe);
  const seen = new Set<string>();
  for (const resolved of values) {
    const identity =
      resolved.kind === "token"
        ? `token:${resolved.tokenPath}`
        : `literal:${typeof resolved.value}:${String(resolved.value)}`;
    if (seen.has(identity)) continue;
    seen.add(identity);

    if (resolved.kind === "token") {
      if (
        !resolved.tokenPath ||
        family.tokenPrefixes.some((prefix) => resolved.tokenPath!.startsWith(prefix))
      )
        continue;
      const examples = formatCandidates(nearestTokens(familyName, family, 0, universe).slice(0, 2));
      diagnostics.push(
        createDiagnostic(
          sourceFile,
          resolved.node,
          "design/wrong-family-token",
          `Design contract: property "${property}" requires a ${familyName} token; found "${resolved.tokenPath}". Use a token from the configured ${familyName} family${examples ? `, such as ${examples}` : ""}.`,
        ),
      );
      continue;
    }

    const literalValue = resolved.value;
    if (literalValue === undefined || literalAllowed(family, literalValue)) continue;
    const isColorFamily = familyName.toLowerCase().includes("color");
    const isViolation = isColorFamily
      ? typeof literalValue === "string" && isColorLiteral(literalValue)
      : parseDimension(literalValue) !== undefined;
    if (!isViolation) continue;

    const candidates = nearestTokens(familyName, family, literalValue, universe);
    const candidateText = formatCandidates(candidates);
    const message = isColorFamily
      ? `Design contract: property "${property}" must use an approved ${familyName} token; found raw literal "${literalValue}". ${candidateText ? `Use a token such as ${candidateText}.` : `Use an approved token from the configured ${familyName} family.`}`
      : `Design contract: property "${property}" must use an approved ${familyName} token; found literal "${literalValue}". ${candidateText ? `Nearest approved tokens: ${candidateText}.` : `Use an approved token from the configured ${familyName} family.`}`;
    diagnostics.push(
      createDiagnostic(sourceFile, resolved.node, `design/${familyName}-literal`, message),
    );
  }
};

const walkStyleObject = (
  sourceFile: ts.SourceFile,
  object: ts.ObjectLiteralExpression,
  config: DesignLintConfig,
  bindings: FileBindings,
  universe: TokenUniverse,
  diagnostics: Diagnostic[],
  skipped: Skipped[],
): void => {
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      skipped.push(
        createSkipped(
          sourceFile,
          property,
          "StyleX style contains a spread and was not fully analyzed.",
        ),
      );
      continue;
    }
    if (!ts.isPropertyAssignment(property)) {
      skipped.push(
        createSkipped(
          sourceFile,
          property,
          "StyleX style contains a computed or unsupported property and was not fully analyzed.",
        ),
      );
      continue;
    }
    const key = getPropertyName(property.name);
    if (!key) {
      skipped.push(
        createSkipped(
          sourceFile,
          property,
          "StyleX style contains a computed or unsupported property and was not fully analyzed.",
        ),
      );
      continue;
    }
    const initializer = unwrapExpression(property.initializer);
    if (familyForProperty(config.tokens.families, key)) {
      if (ts.isObjectLiteralExpression(initializer)) {
        for (const condition of initializer.properties) {
          if (ts.isSpreadAssignment(condition)) {
            skipped.push(
              createSkipped(
                sourceFile,
                condition,
                `StyleX conditional value for "${key}" contains a spread and was not fully analyzed.`,
              ),
            );
          } else if (ts.isPropertyAssignment(condition)) {
            walkStyleValue(
              sourceFile,
              condition.initializer,
              key,
              config,
              bindings,
              universe,
              diagnostics,
              skipped,
            );
          } else {
            skipped.push(
              createSkipped(
                sourceFile,
                condition,
                `StyleX conditional value for "${key}" contains an unsupported branch and was not fully analyzed.`,
              ),
            );
          }
        }
      } else {
        walkStyleValue(
          sourceFile,
          initializer,
          key,
          config,
          bindings,
          universe,
          diagnostics,
          skipped,
        );
      }
    } else if (isSelectorKey(key) && ts.isObjectLiteralExpression(initializer)) {
      walkStyleObject(sourceFile, initializer, config, bindings, universe, diagnostics, skipped);
    }
  }
};

const walkStyleValue = (
  sourceFile: ts.SourceFile,
  expression: ts.Expression,
  property: string,
  config: DesignLintConfig,
  bindings: FileBindings,
  universe: TokenUniverse,
  diagnostics: Diagnostic[],
  skipped: Skipped[],
): void => {
  const value = unwrapExpression(expression);
  if (ts.isObjectLiteralExpression(value)) {
    for (const condition of value.properties) {
      if (ts.isSpreadAssignment(condition)) {
        skipped.push(
          createSkipped(
            sourceFile,
            condition,
            `StyleX conditional value for "${property}" contains a spread and was not fully analyzed.`,
          ),
        );
      } else if (ts.isPropertyAssignment(condition)) {
        walkStyleValue(
          sourceFile,
          condition.initializer,
          property,
          config,
          bindings,
          universe,
          diagnostics,
          skipped,
        );
      } else {
        skipped.push(
          createSkipped(
            sourceFile,
            condition,
            `StyleX conditional value for "${property}" contains an unsupported branch and was not fully analyzed.`,
          ),
        );
      }
    }
    return;
  }
  if (hasUnresolvedStaticValue(value, bindings, universe)) {
    skipped.push(
      createSkipped(
        sourceFile,
        value,
        `StyleX property "${property}" is dynamic or not statically provable and was not fully analyzed.`,
      ),
    );
  }
  checkStyleValue(sourceFile, value, property, config, bindings, universe, diagnostics);
};

const collectStyleProperties = (
  definition: StyleDefinition,
  seen = new Set<ts.ObjectLiteralExpression>(),
): { properties: Set<string>; unresolved: boolean } => {
  if (definition.dynamic || !definition.node) return { properties: new Set(), unresolved: true };
  if (seen.has(definition.node)) return { properties: new Set(), unresolved: true };
  seen.add(definition.node);
  const properties = new Set<string>();
  let unresolved = false;
  for (const property of definition.node.properties) {
    if (ts.isSpreadAssignment(property)) {
      unresolved = true;
      continue;
    }
    if (!ts.isPropertyAssignment(property)) continue;
    const key = getPropertyName(property.name);
    if (!key) {
      unresolved = true;
      continue;
    }
    if (
      isSelectorKey(key) &&
      ts.isObjectLiteralExpression(unwrapExpression(property.initializer))
    ) {
      const nested = collectStyleProperties(
        {
          name: `${definition.name}.${key}`,
          node: unwrapExpression(property.initializer) as ts.ObjectLiteralExpression,
          dynamic: false,
        },
        seen,
      );
      for (const nestedProperty of nested.properties) properties.add(nestedProperty);
      unresolved ||= nested.unresolved;
    } else {
      properties.add(key);
    }
  }
  return { properties, unresolved };
};

const getStyleReference = (
  expression: ts.Expression,
  bindings: FileBindings,
): StyleReference | undefined => {
  const chain = getMemberChain(expression);
  if (!chain || chain.length !== 2) return undefined;
  if (isShadowedAt(chain[0]!, expression, bindings)) return undefined;
  const namespace = bindings.styleNamespaces.get(chain[0]!);
  const definition = namespace?.get(chain[1]!);
  return definition ? { definition, expression } : undefined;
};

const resolveXstyle = (
  expression: ts.Expression,
  bindings: FileBindings,
  seen = new Set<string>(),
): ResolvedXstyle => {
  const value = unwrapExpression(expression);
  if (value.kind === ts.SyntaxKind.FalseKeyword || value.kind === ts.SyntaxKind.NullKeyword) {
    return { references: [], unresolved: false };
  }

  const direct = getStyleReference(value, bindings);
  if (direct) return { references: [direct], unresolved: direct.definition.dynamic };

  if (ts.isIdentifier(value)) {
    if (isShadowedAt(value.text, value, bindings)) return { references: [], unresolved: true };
    if (seen.has(value.text)) return { references: [], unresolved: true };
    const initializer = bindings.staticValues.get(value.text);
    if (!initializer) return { references: [], unresolved: true };
    const next = new Set(seen);
    next.add(value.text);
    return resolveXstyle(initializer, bindings, next);
  }

  if (ts.isArrayLiteralExpression(value)) {
    let unresolved = false;
    const references: StyleReference[] = [];
    for (const element of value.elements) {
      if (ts.isSpreadElement(element)) {
        unresolved = true;
        continue;
      }
      const resolved = resolveXstyle(element, bindings, seen);
      references.push(...resolved.references);
      unresolved ||= resolved.unresolved;
    }
    return { references, unresolved };
  }

  if (ts.isConditionalExpression(value)) {
    const whenTrue = resolveXstyle(value.whenTrue, bindings, seen);
    const whenFalse = resolveXstyle(value.whenFalse, bindings, seen);
    return {
      references: [...whenTrue.references, ...whenFalse.references],
      unresolved: whenTrue.unresolved || whenFalse.unresolved,
    };
  }

  if (ts.isBinaryExpression(value)) {
    if (value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      if (isBooleanLiteral(value.left, false)) return { references: [], unresolved: false };
      return resolveXstyle(value.right, bindings, seen);
    }
    if (
      value.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      const left = resolveXstyle(value.left, bindings, seen);
      const right = resolveXstyle(value.right, bindings, seen);
      return {
        references: [...left.references, ...right.references],
        unresolved: left.unresolved || right.unresolved,
      };
    }
  }
  return { references: [], unresolved: true };
};

const walkFile = async (
  path: string,
  config: DesignLintConfig,
  universe: TokenUniverse,
  diagnostics: Diagnostic[],
  skipped: Skipped[],
): Promise<void> => {
  const source = await readFile(path, "utf8");
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") || path.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const bindings = collectImports(sourceFile, config, universe);
  collectStyleNamespaces(sourceFile, bindings);

  const reportSkipped = (node: ts.Node, reason: string): void => {
    const position = getNodePosition(sourceFile, node);
    skipped.push({ path, ...position, reason });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isStylexCreateCall(node, bindings)) {
      const definitions = bindings.namespacesByCall.get(node);
      if (definitions) {
        for (const definition of definitions.values()) {
          if (definition.node) {
            walkStyleObject(
              sourceFile,
              definition.node,
              config,
              bindings,
              universe,
              diagnostics,
              skipped,
            );
          } else {
            reportSkipped(
              node,
              `StyleX style "${definition.name}" is dynamic and was not analyzed.`,
            );
          }
        }
      }
    }

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
      const component =
        ts.isIdentifier(tagName) && !isShadowedAt(tagName.text, tagName, bindings)
          ? bindings.componentBindings.get(tagName.text)
          : undefined;
      if (component) {
        const attributes = ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;
        const xstyle = attributes.properties.find(
          (attribute): attribute is ts.JsxAttribute =>
            ts.isJsxAttribute(attribute) &&
            ts.isIdentifier(attribute.name) &&
            attribute.name.text === "xstyle",
        );
        if (
          xstyle?.initializer &&
          ts.isJsxExpression(xstyle.initializer) &&
          xstyle.initializer.expression
        ) {
          const resolved = resolveXstyle(xstyle.initializer.expression, bindings);
          const seen = new Set<string>();
          for (const reference of resolved.references) {
            const identity = `${reference.definition.name}:${reference.expression.getText(sourceFile)}`;
            if (seen.has(identity)) continue;
            seen.add(identity);
            const properties = collectStyleProperties(reference.definition);
            for (const property of properties.properties) {
              const positionNode = reference.expression;
              if (component.ownedXstyleProperties.includes(property)) {
                diagnostics.push(
                  createDiagnostic(
                    sourceFile,
                    positionNode,
                    "component/owned-xstyle",
                    `Design contract: ${component.export} owns "${property}" and it cannot be overridden through xstyle style "${positionNode.getText(sourceFile)}". ${component.guidance}`,
                  ),
                );
              } else if (!component.allowedXstyleProperties.includes(property)) {
                diagnostics.push(
                  createDiagnostic(
                    sourceFile,
                    positionNode,
                    "component/undeclared-xstyle",
                    `Design contract: ${component.export} does not declare "${property}" as an allowed xstyle override. Add it to allowedXstyleProperties only when it is a supported layout override, or use the component API. ${component.guidance}`,
                  ),
                );
              }
            }
            if (properties.unresolved) {
              reportSkipped(
                reference.expression,
                `xstyle style "${reference.definition.name}" contains an unresolved spread.`,
              );
            }
          }
          if (resolved.unresolved) {
            reportSkipped(
              xstyle,
              `xstyle for ${component.export} is dynamic or cross-file and was not proven.`,
            );
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
};

const normalizeSources = (source: string | string[]): string[] =>
  Array.isArray(source) ? source : [source];

export async function lintFiles(
  files: string[],
  config: DesignLintConfig,
  options: LintOptions = {},
): Promise<LintResult> {
  const normalized = validateConfig(config);
  const configDir = options.configDir ?? process.cwd();
  const universe = await loadTokenRecords(normalizeSources(normalized.tokens.source), configDir);
  const diagnostics: Diagnostic[] = [];
  const skipped: Skipped[] = [];
  for (const file of files) {
    await walkFile(resolve(file), normalized, universe, diagnostics, skipped);
  }
  const uniqueSkipped = new Map<string, Skipped>();
  for (const item of skipped) {
    uniqueSkipped.set(`${item.path}:${item.line}:${item.column}:${item.reason}`, item);
  }
  skipped.splice(0, skipped.length, ...uniqueSkipped.values());
  if (normalized.unresolved === "warn") {
    for (const item of skipped) {
      diagnostics.push({
        ruleId: "design/unresolved-composition",
        severity: "warning",
        path: item.path,
        line: item.line,
        column: item.column,
        message: `Design contract: ${item.reason} Review this composition manually; v1 cannot prove it.`,
      });
    }
  }
  diagnostics.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.line - right.line ||
      left.column - right.column ||
      left.ruleId.localeCompare(right.ruleId),
  );
  skipped.sort(
    (left, right) =>
      left.path.localeCompare(right.path) || left.line - right.line || left.column - right.column,
  );
  return { diagnostics, skipped };
}

export async function runDesignLint(options: RunDesignLintOptions): Promise<LintResult> {
  const cwd = options.cwd ?? process.cwd();
  if (typeof options.config === "string") {
    const configPath = resolve(cwd, options.config);
    const config = await loadConfig(configPath);
    const patterns = options.files ?? config.files ?? [];
    if (patterns.length === 0) throw new Error("No files were provided and config.files is empty.");
    const files = await resolveFilePatterns(patterns, dirname(configPath));
    if (files.length === 0) throw new Error("No source files matched the configured patterns.");
    return lintFiles(files, config, { configDir: dirname(configPath) });
  }
  const config = validateConfig(options.config);
  const patterns = options.files ?? config.files ?? [];
  if (patterns.length === 0) throw new Error("No files were provided and config.files is empty.");
  const files = await resolveFilePatterns(patterns, cwd);
  if (files.length === 0) throw new Error("No source files matched the configured patterns.");
  return lintFiles(files, config, { configDir: cwd });
}
