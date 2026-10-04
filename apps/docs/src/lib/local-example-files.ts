import { readFile, stat, realpath } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import { docsDirectory } from "./docs-directory.mjs";

const docsRoot = docsDirectory();

/** The source pane and tooling read the same local entry and relative helper graph. */
export async function localExampleFiles(entry: string, directory = docsRoot) {
  const root = path.resolve(directory, "src/demos");
  const realRoot = await realpath(root);
  const seen = new Set<string>();
  const files: { file: string; code: string }[] = [];
  async function visit(file: string): Promise<void> {
    if (seen.has(file)) return;
    if (!file.startsWith(`${root}${path.sep}`))
      throw new Error(`Example helper escapes local demo root: ${file}`);
    const actual = await realpath(file);
    if (!actual.startsWith(`${realRoot}${path.sep}`))
      throw new Error(`Example helper escapes local demo root through a symlink: ${file}`);
    seen.add(file);
    const code = await readFile(file, "utf8");
    files.push({ file: path.relative(root, file).replaceAll(path.sep, "/"), code });
    if (!/\.[cm]?[jt]sx?$/.test(file)) return;
    const source = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      createImportExpressions: true,
    });
    const imports: string[] = [];
    for (const statement of source.program.body) {
      if (
        statement.type !== "ImportDeclaration" &&
        statement.type !== "ExportNamedDeclaration" &&
        statement.type !== "ExportAllDeclaration"
      )
        continue;
      const specifier = statement.source;
      if (!specifier || !specifier.value.startsWith(".")) continue;
      imports.push(specifier.value);
    }
    function collectDynamic(value: unknown): void {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(collectDynamic);
        return;
      }
      const node = value as { type?: string; source?: { type: string; value: string } };
      if (node.type === "ImportExpression") {
        if (node.source?.type !== "StringLiteral")
          throw new Error(`Example source graph requires a literal dynamic import: ${file}`);
        if (node.source.value.startsWith(".")) imports.push(node.source.value);
      }
      Object.values(value).forEach(collectDynamic);
    }
    collectDynamic(source.program);
    for (const specifier of new Set(imports)) {
      const base = path.resolve(path.dirname(file), specifier);
      const sourceBase = base.replace(/\.[cm]?jsx?$/, "");
      const candidates = [
        base,
        `${sourceBase}.tsx`,
        `${sourceBase}.ts`,
        `${sourceBase}.mts`,
        `${sourceBase}.cts`,
        `${base}.tsx`,
        `${base}.ts`,
        path.join(base, "index.tsx"),
        path.join(base, "index.ts"),
      ];
      let resolved = false;
      for (const candidate of new Set(candidates)) {
        const info = await stat(candidate).catch(() => null);
        if (info?.isFile()) {
          await visit(candidate);
          resolved = true;
          break;
        }
      }
      if (!resolved)
        throw new Error(`Missing local example helper: ${specifier} imported by ${file}`);
    }
  }
  await visit(path.resolve(root, entry));
  return files;
}
