import { parse } from "@babel/parser";

export function parseSource(source: string, filename: string) {
  return parse(source, {
    sourceType: "module",
    sourceFilename: filename,
    plugins: ["typescript", "jsx"],
  });
}

type SyntaxNode = {
  type: string;
  value?: string;
  name?: string;
  importKind?: string;
  exportKind?: string;
  source?: SyntaxNode;
  callee?: SyntaxNode;
  arguments?: SyntaxNode[];
  specifiers?: SyntaxNode[];
  loc?: { start: { line: number; column: number } };
};

export function runtimeModuleReferenceDetails(source: string, filename: string) {
  const references: { module: string | null; location: { line: number; column: number } }[] = [];
  function record(node: SyntaxNode | undefined, fallback: SyntaxNode) {
    const location = node?.loc?.start ?? fallback.loc?.start;
    if (!location) throw new Error(`Missing source location in ${filename}`);
    references.push({
      module: node?.type === "StringLiteral" ? (node.value ?? null) : null,
      location,
    });
  }
  function visit(value: unknown): void {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const node = value as SyntaxNode;
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportAllDeclaration"
    ) {
      const kind = node.type === "ImportDeclaration" ? "importKind" : "exportKind";
      if (
        node.source &&
        node[kind] !== "type" &&
        (!node.specifiers?.length ||
          node.specifiers.some((specifier) => specifier[kind] !== "type"))
      )
        record(node.source, node);
    } else if (node.type === "ImportExpression") {
      record(node.source, node);
    } else if (
      node.type === "CallExpression" &&
      (node.callee?.type === "Import" ||
        (node.callee?.type === "Identifier" && node.callee.name === "require"))
    ) {
      record(node.arguments?.[0], node);
    }
    Object.values(value).forEach(visit);
  }
  visit(parseSource(source, filename).program);
  return references;
}

export function runtimeModuleReferences(source: string, filename: string) {
  return [
    ...new Set(
      runtimeModuleReferenceDetails(source, filename)
        .map(({ module }) => module)
        .filter((module) => module !== null),
    ),
  ];
}
