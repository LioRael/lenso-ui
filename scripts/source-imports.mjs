import { parse } from "@babel/parser";

export function parseSource(source, filename) {
  return parse(source, {
    sourceType: "module",
    sourceFilename: filename,
    plugins: ["typescript", "jsx"],
  });
}

export function runtimeModuleReferenceDetails(source, filename) {
  const ast = parseSource(source, filename);
  const references = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
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
        references.push({ module: node.source.value, location: node.source.loc.start });
    } else if (node.type === "ImportExpression") {
      references.push({
        module: node.source.type === "StringLiteral" ? node.source.value : null,
        location: node.source.loc.start,
      });
    } else if (
      node.type === "CallExpression" &&
      (node.callee.type === "Import" ||
        (node.callee.type === "Identifier" && node.callee.name === "require"))
    ) {
      references.push({
        module: node.arguments[0]?.type === "StringLiteral" ? node.arguments[0].value : null,
        location: node.arguments[0]?.loc.start ?? node.loc.start,
      });
    }
    for (const value of Object.values(node)) visit(value);
  }
  visit(ast.program);
  return references;
}

export function runtimeModuleReferences(source, filename) {
  return [
    ...new Set(
      runtimeModuleReferenceDetails(source, filename)
        .map(({ module }) => module)
        .filter((module) => module !== null),
    ),
  ];
}
