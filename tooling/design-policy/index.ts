import { parseSource, runtimeModuleReferenceDetails } from "../../scripts/source-imports.ts";
import type { Node, SourceLocation } from "@babel/types";

export interface Diagnostic {
  ruleId: string;
  severity: "error";
  file: string;
  line: number;
  column: number;
  message: string;
}
export interface Skipped {
  ruleId: string;
  file: string;
  line?: number;
  column?: number;
  reason: string;
}
export interface PolicyInput {
  files: { filename: string; source: string }[];
  mode: "library" | "consumer";
}

const specialized =
  /\/(?:components|demos\/(?:en|cn))\/(?:calendar(?:\/|-)|range-calendar\/|date-|time-|color-)/;
const aria =
  /^(?:react-aria(?:-components)?(?:\/|$)|react-stately(?:\/|$)|@react-aria\/|@react-stately\/)/;
const tailwind = /^(?:tailwind-variants|tailwindcss)(?:\/|$)/;
const legacy = /^@lenso\/(?:design-lint|fonts|docs)(?:\/|$)/;

export function checkDesignPolicy(input: unknown): {
  diagnostics: Diagnostic[];
  skipped: Skipped[];
} {
  if (!input || typeof input !== "object") throw new TypeError("Invalid policy input");
  const { files, mode } = input as Partial<PolicyInput>;
  if (mode !== "library" && mode !== "consumer")
    throw new TypeError("mode must be library or consumer");
  if (!Array.isArray(files))
    throw new TypeError("files must be an array of filename/source records");
  const diagnostics: Diagnostic[] = [];
  const skipped: Skipped[] = [];
  for (const { filename, source } of files) {
    if (typeof filename !== "string" || typeof source !== "string")
      throw new TypeError("Each file needs a filename and source string");
    const file = filename.replaceAll("\\", "/");
    const report = (
      ruleId: string,
      node: Pick<SourceLocation["start"], "line" | "column">,
      message: string,
    ) =>
      diagnostics.push({
        ruleId,
        severity: "error",
        file,
        line: node.line,
        column: node.column + 1,
        message,
      });
    let ast: ReturnType<typeof parseSource>;
    try {
      ast = parseSource(source, file);
      for (const { module, location } of runtimeModuleReferenceDetails(source, file)) {
        if (module === null) {
          skipped.push({
            file,
            ruleId: "lenso/runtime-import",
            line: location.line,
            column: location.column + 1,
            reason: "Runtime module expression is not a static string",
          });
          continue;
        }
        if (legacy.test(module))
          report("lenso/no-legacy-import", location, `Removed Lenso runtime import: ${module}`);
        if (tailwind.test(module))
          report("lenso/no-tailwind-runtime", location, `Tailwind runtime import: ${module}`);
        if (mode === "library" && aria.test(module) && !specialized.test(`/${file}`))
          report(
            "lenso/react-aria-family",
            location,
            `React Aria runtime outside date, time and color families: ${module}`,
          );
      }
    } catch (error) {
      const location = error instanceof Error && "loc" in error ? error.loc : undefined;
      const loc =
        location && typeof location === "object" ? (location as Record<string, unknown>) : {};
      skipped.push({
        file,
        ruleId: "lenso/source-analysis",
        line: typeof loc["line"] === "number" ? loc["line"] : 1,
        column: (typeof loc["column"] === "number" ? loc["column"] : 0) + 1,
        reason: `Unresolved syntax: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }
    const bindings = new Set<string>();
    for (const statement of ast.program.body) {
      if (statement.type === "ImportDeclaration" && statement.source.value === "@stylexjs/stylex") {
        for (const specifier of statement.specifiers) {
          if (["ImportDefaultSpecifier", "ImportNamespaceSpecifier"].includes(specifier.type))
            bindings.add(specifier.local.name);
        }
      }
    }
    // Only direct module-level bindings are supported; shadowed bindings are not proof.
    const shadowed = new Set<string>();
    walk(ast.program, (node) => {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        for (const parameter of node.params)
          for (const name of bindingNames(parameter)) shadowed.add(name);
      }
      if (node.type === "VariableDeclarator")
        for (const name of bindingNames(node.id)) shadowed.add(name);
      if (node.type === "CatchClause")
        for (const name of bindingNames(node.param)) shadowed.add(name);
      if ((node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") && node.id)
        shadowed.add(node.id.name);
    });
    walk(ast.program, (node, parent, ancestors) => {
      if (
        node.type !== "CallExpression" ||
        node.callee.type !== "MemberExpression" ||
        node.callee.computed ||
        node.callee.property.type !== "Identifier" ||
        node.callee.property.name !== "props" ||
        node.callee.object.type !== "Identifier" ||
        !bindings.has(node.callee.object.name)
      )
        return;
      if (shadowed.has(node.callee.object.name)) {
        skipped.push({
          file,
          ruleId: "lenso/stylex-analysis",
          line: node.loc?.start.line ?? 1,
          column: (node.loc?.start.column ?? 0) + 1,
          reason: "StyleX binding is shadowed; composition is unresolved",
        });
        return;
      }
      if (
        parent?.type === "MemberExpression" &&
        parent.object === node &&
        !parent.computed &&
        parent.property.type === "Identifier" &&
        parent.property.name === "className" &&
        ancestors.some(
          (ancestor) =>
            ancestor.type === "JSXAttribute" &&
            ancestor.name.type === "JSXIdentifier" &&
            ancestor.name.name === "className" &&
            ancestor.value?.type === "JSXExpressionContainer" &&
            ancestor.value.expression === parent,
        )
      )
        report(
          "lenso/stylex-output",
          node.loc?.start ?? { line: 1, column: 0 },
          "Keep the full StyleX props output; className alone drops runtime styles",
        );
      const callerIndex = node.arguments.findIndex(
        (argument) => argument.type === "Identifier" && argument.name === "xstyle",
      );
      if (callerIndex >= 0 && callerIndex !== node.arguments.length - 1) {
        const owner = ancestors.findLast(
          (
            ancestor,
          ): ancestor is Extract<
            Node,
            { type: "FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression" }
          > =>
            ancestor.type === "FunctionDeclaration" ||
            ancestor.type === "FunctionExpression" ||
            ancestor.type === "ArrowFunctionExpression",
        );
        const callerBound = owner?.params.some((parameter) =>
          parameter.type === "Identifier"
            ? parameter.name === "xstyle"
            : parameter.type === "ObjectPattern" &&
              parameter.properties.some(
                (property) =>
                  property.type === "ObjectProperty" &&
                  property.key.type === "Identifier" &&
                  property.key.name === "xstyle" &&
                  property.value.type === "Identifier" &&
                  property.value.name === "xstyle",
              ),
        );
        if (callerBound)
          report(
            "lenso/xstyle-last",
            node.loc?.start ?? { line: 1, column: 0 },
            "Compose caller xstyle last",
          );
        else
          skipped.push({
            file,
            ruleId: "lenso/xstyle-last",
            line: node.loc?.start.line ?? 1,
            column: (node.loc?.start.column ?? 0) + 1,
            reason: "xstyle is not a directly supported caller parameter binding",
          });
      }
    });
  }
  const order = (a: Diagnostic | Skipped, b: Diagnostic | Skipped) =>
    a.file.localeCompare(b.file) ||
    (a.line ?? 1) - (b.line ?? 1) ||
    (a.column ?? 1) - (b.column ?? 1) ||
    a.ruleId.localeCompare(b.ruleId);
  return { diagnostics: diagnostics.sort(order), skipped: skipped.sort(order) };
}

type Visitor = (node: Node, parent: Node | undefined, ancestors: Node[]) => void;
function walk(node: unknown, visit: Visitor, parent?: Node, ancestors: Node[] = []): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit, parent, ancestors);
    return;
  }
  const syntax = "type" in node && typeof node.type === "string" ? (node as Node) : undefined;
  if (syntax) visit(syntax, parent, ancestors);
  for (const [key, value] of Object.entries(node))
    if (!["loc", "tokens", "comments"].includes(key))
      walk(value, visit, syntax ?? parent, syntax ? [...ancestors, syntax] : ancestors);
}

function bindingNames(pattern: Node | null | undefined): string[] {
  if (!pattern) return [];
  if (pattern.type === "Identifier") return [pattern.name];
  if (pattern.type === "AssignmentPattern") return bindingNames(pattern.left);
  if (pattern.type === "RestElement") return bindingNames(pattern.argument);
  if (pattern.type === "ObjectPattern")
    return pattern.properties.flatMap((property) =>
      bindingNames(property.type === "RestElement" ? property.argument : property.value),
    );
  if (pattern.type === "ArrayPattern") return pattern.elements.flatMap(bindingNames);
  return [];
}
