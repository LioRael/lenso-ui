import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { implementationRoot, validateRepositoryPath } from "./index.ts";
import {
  implementationCandidates,
  implementationImports,
  themeDeclarations,
  themeEditableTokens,
} from "./source-parser.ts";
import type { ApiFamily, Source, SourceFile, Theme } from "./types.ts";

export { themeDeclarations } from "./source-parser.ts";

async function safeSource(directory: string, file: string, prefix: string): Promise<SourceFile> {
  validateRepositoryPath(file, prefix, directory);
  return { file, code: await readFile(path.join(directory, file), "utf8") };
}

/** Only relative local imports are included; external/native packages remain external. */
export async function collectImplementationSource(
  directory: string,
  family: string,
  api: ApiFamily,
): Promise<Source> {
  const entry = implementationRoot(family, api);
  const files = new Map<string, SourceFile>();
  async function visit(file: string): Promise<void> {
    if (files.has(file)) return;
    const source = await safeSource(directory, file, "packages/react/src/");
    files.set(file, source);
    for (const specifier of implementationImports(source)) {
      let found: string | undefined;
      for (const candidate of implementationCandidates(file, specifier)) {
        if ((await stat(path.join(directory, candidate)).catch(() => null))?.isFile()) {
          found = candidate;
          break;
        }
      }
      if (!found)
        throw new Error(`Missing local implementation helper: ${specifier} imported by ${file}`);
      await visit(found);
    }
  }
  await visit(entry);
  // Public compound assembly and reused local parts have their own API provenance.
  for (const file of [...new Set(api.parts.map((part) => part.source.path))].sort())
    await visit(file);
  return {
    family,
    ...files.get(entry)!,
    files: [...files.values()]
      .filter((source) => source.file !== entry)
      .sort((a, b) => a.file.localeCompare(b.file)),
  };
}

export async function collectTheme(directory: string): Promise<Theme> {
  const files: SourceFile[] = [];
  const seen = new Set<string>();
  async function visit(file: string): Promise<void> {
    if (seen.has(file)) return;
    seen.add(file);
    const source = await safeSource(directory, file, "packages/styles/themes/");
    files.push(source);
    for (const match of source.code.matchAll(
      /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g,
    )) {
      const specifier = match[1]!;
      if (!specifier.startsWith("."))
        throw new Error(`Theme source import must be local: ${specifier}`);
      await visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)));
    }
  }
  await visit("packages/styles/themes/default/index.css");
  const editorSource = await safeSource(
    directory,
    "packages/styles/src/theme.ts",
    "packages/styles/src/",
  );
  return {
    files,
    declarations: files.flatMap(themeDeclarations),
    editableTokens: themeEditableTokens(editorSource),
    editorSource,
  };
}
