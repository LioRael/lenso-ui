import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import type { ReactNode } from "react";
import { highlightSource } from "./highlight-source";

export async function exampleSourceFiles(entry: string) {
  const root = path.resolve(process.cwd(), "src/demos");
  const seen = new Set<string>();
  const files: { name: string; code: string; highlighted: ReactNode }[] = [];
  async function visit(file: string): Promise<void> {
    if (seen.has(file) || !file.startsWith(`${root}${path.sep}`)) return;
    seen.add(file);
    const code = await readFile(file, "utf8");
    files.push({
      name: path.relative(root, file),
      code,
      highlighted: await highlightSource(code, path.extname(file).slice(1)),
    });
    if (!/\.[cm]?[jt]sx?$/.test(file)) return;
    const source = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
    for (const statement of source.program.body) {
      if (
        statement.type !== "ImportDeclaration" &&
        statement.type !== "ExportNamedDeclaration" &&
        statement.type !== "ExportAllDeclaration"
      )
        continue;
      const specifier = statement.source;
      if (!specifier || !specifier.value.startsWith(".")) continue;
      const base = path.resolve(path.dirname(file), specifier.value);
      for (const candidate of [
        base,
        `${base}.tsx`,
        `${base}.ts`,
        path.join(base, "index.tsx"),
        path.join(base, "index.ts"),
      ]) {
        const info = await stat(candidate).catch(() => null);
        if (info?.isFile()) {
          await visit(candidate);
          break;
        }
      }
    }
  }
  await visit(path.resolve(root, entry));
  return files;
}
