import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import { transformSync, type NodePath } from "@babel/core";
import * as t from "@babel/types";
import type { Plugin } from "vite";

/** Read named exports through source barrels without loading unrelated components. */
export function sourceImports(entries: Record<string, string>): Plugin {
  const parsed = new Map<string, ReturnType<typeof parse>>();
  const resolved = new Map<string, { file: string; name: string } | null>();
  const barrels = new Set<string>();
  const importers = new Set<string>();
  const sourceFile = (from: string, source: string) => {
    const base = path.resolve(path.dirname(from), source).replace(/\.js$/, "");
    return [base + ".ts", base + ".tsx", base + ".js"].find(existsSync)!;
  };
  const nameOf = (node: t.Identifier | t.StringLiteral) =>
    t.isIdentifier(node) ? node.name : node.value;
  const find = (
    file: string,
    name: string,
    visiting = new Set<string>(),
  ): { file: string; name: string } | null => {
    const key = `${file}:${name}`;
    if (resolved.has(key)) return resolved.get(key)!;
    if (visiting.has(key)) return null;
    visiting.add(key);
    let ast = parsed.get(file);
    if (!ast) {
      ast = parse(readFileSync(file, "utf8"), {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
      parsed.set(file, ast);
    }
    const pure = ast.program.body.every(
      (node) =>
        t.isExportAllDeclaration(node) ||
        (t.isExportNamedDeclaration(node) && (node.source || node.exportKind === "type")) ||
        (t.isImportDeclaration(node) && node.importKind === "type"),
    );
    if (pure) barrels.add(file);
    let result: { file: string; name: string } | null = null;
    for (const node of ast.program.body) {
      if (t.isExportNamedDeclaration(node) && node.exportKind !== "type") {
        const spec = node.specifiers.find(
          (spec) =>
            t.isExportSpecifier(spec) &&
            spec.exportKind !== "type" &&
            nameOf(spec.exported) === name,
        );
        if (spec && t.isExportSpecifier(spec)) {
          result =
            node.source && pure
              ? node.source.value.startsWith(".")
                ? find(sourceFile(file, node.source.value), nameOf(spec.local), visiting)
                : { file: node.source.value, name: nameOf(spec.local) }
              : { file, name };
        }
        const declaration = node.declaration;
        if (
          declaration &&
          (t.isVariableDeclaration(declaration)
            ? declaration.declarations.some((part) => t.isIdentifier(part.id, { name }))
            : (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration)) &&
              declaration.id?.name === name)
        )
          result = { file, name };
      } else if (t.isExportDefaultDeclaration(node) && name === "default") {
        result = { file, name };
      } else if (
        t.isExportAllDeclaration(node) &&
        node.exportKind !== "type" &&
        node.source.value.startsWith(".")
      ) {
        const child = find(sourceFile(file, node.source.value), name, visiting);
        if (child) result = pure ? child : { file, name };
      }
      if (result) break;
    }
    resolved.set(key, result);
    return result;
  };

  return {
    name: "lenso-source-imports",
    apply: "serve",
    enforce: "pre",
    transform(code, id) {
      if (
        id.includes("/node_modules/") ||
        !/\.[jt]sx?(?:\?|$)/.test(id) ||
        !Object.keys(entries).some(
          (entry) => code.includes(`"${entry}"`) || code.includes(`'${entry}'`),
        )
      )
        return;
      let changed = false;
      const output = transformSync(code, {
        filename: id.split("?")[0],
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [
          () => ({
            visitor: {
              ImportDeclaration(importPath: NodePath<t.ImportDeclaration>) {
                const node = importPath.node;
                const entry = entries[node.source.value];
                if (!entry || node.importKind === "type") return;
                const remaining = [];
                const groups = new Map<string, t.ImportSpecifier[]>();
                for (const spec of node.specifiers) {
                  const target =
                    t.isImportSpecifier(spec) && spec.importKind !== "type"
                      ? find(entry, nameOf(spec.imported))
                      : null;
                  if (!target) {
                    remaining.push(spec);
                    continue;
                  }
                  const specs = groups.get(target.file) ?? [];
                  specs.push(t.importSpecifier(spec.local, t.identifier(target.name)));
                  groups.set(target.file, specs);
                }
                if (!groups.size) return;
                changed = true;
                importPath.replaceWithMultiple([
                  ...[...groups].map(([file, specs]) =>
                    t.importDeclaration(specs, t.stringLiteral(file)),
                  ),
                  ...(remaining.length ? [t.importDeclaration(remaining, node.source)] : []),
                ]);
              },
            },
          }),
        ],
      });
      if (!changed) return;
      importers.add(id);
      for (const file of barrels) this.addWatchFile(file);
      return { code: output!.code!, map: output!.map };
    },
    hotUpdate({ file }) {
      if (parsed.has(file)) {
        parsed.clear();
        resolved.clear();
      }
      if (!barrels.has(file)) return;
      const modules = [...importers].flatMap((id) => {
        const module = this.environment.moduleGraph.getModuleById(id);
        if (!module) return [];
        this.environment.moduleGraph.invalidateModule(module);
        return [module];
      });
      return modules;
    },
  };
}
