import { parse } from "@babel/parser";

export function runtimeModuleReferences(source, filename) {
  const ast = parse(source, {
    sourceType: "module",
    sourceFilename: filename,
    plugins: ["typescript", "jsx"],
  });
  const references = new Set();
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
        references.add(node.source.value);
    } else if (node.type === "ImportExpression" && node.source.type === "StringLiteral") {
      references.add(node.source.value);
    } else if (
      node.type === "CallExpression" &&
      (node.callee.type === "Import" ||
        (node.callee.type === "Identifier" && node.callee.name === "require")) &&
      node.arguments[0]?.type === "StringLiteral"
    ) {
      references.add(node.arguments[0].value);
    }
    for (const value of Object.values(node)) visit(value);
  }
  visit(ast.program);
  return [...references];
}
