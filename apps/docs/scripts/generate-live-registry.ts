import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";
import { format } from "oxfmt";
import { canonicalDemoFile, canonicalExampleName } from "./docs-projection.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
type SourceEntry = { source: string; file?: string; exported?: string };
type SourceIndex = { examples: Record<string, Record<string, SourceEntry>> };
export type LiveManifest = { en: Record<string, string>; cn: Record<string, string> };
export type LocalizedChoices = Pick<LiveManifest, "cn">;
type Example = { name: string; file: string; exported: string; locale: "en" | "cn" };

export function findDemoExport(code: string, filename: string, preferred?: string): string {
  const source = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const candidates: string[] = [];
  const bindings = new Map<string, ts.Node>();
  const isAmbient = (node: ts.Node): boolean =>
    ts.canHaveModifiers(node) &&
    !!ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword);
  const callable = (node: ts.Node | undefined): boolean =>
    !!node &&
    ((ts.isFunctionDeclaration(node) && !!node.body && !isAmbient(node)) ||
      ts.isClassDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isClassExpression(node) ||
      (ts.isCallExpression(node) &&
        ["memo", "forwardRef"].includes(
          ts.isPropertyAccessExpression(node.expression)
            ? node.expression.name.text
            : node.expression.getText(source),
        )));
  for (const statement of source.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name)
      bindings.set(statement.name.text, statement);
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name) && declaration.initializer)
          bindings.set(declaration.name.text, declaration.initializer);
  }
  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      if (
        callable(
          ts.isIdentifier(statement.expression)
            ? bindings.get(statement.expression.text)
            : statement.expression,
        )
      )
        candidates.push("default");
    } else if (ts.isExportDeclaration(statement) && !statement.isTypeOnly) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause))
        for (const specifier of statement.exportClause.elements) {
          const local = (specifier.propertyName ?? specifier.name).text;
          if (!specifier.isTypeOnly && (!bindings.has(local) || callable(bindings.get(local))))
            candidates.push(specifier.name.text);
        }
    } else if (
      ts.canHaveModifiers(statement) &&
      ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const isDefault = ts
        .getModifiers(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
      if (
        (ts.isFunctionDeclaration(statement) && callable(statement)) ||
        ts.isClassDeclaration(statement)
      ) {
        if (isDefault) candidates.push("default");
        else if (statement.name) candidates.push(statement.name.text);
      } else if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name) && callable(declaration.initializer))
            candidates.push(declaration.name.text);
    }
  }
  const exported = preferred && candidates.includes(preferred) ? preferred : candidates[0];
  if (!exported) throw new Error(`No exported live demo in ${filename}`);
  return exported;
}

export async function discoverLiveExamples(
  directory: string,
  source: SourceIndex,
): Promise<Example[]> {
  const entries = await Promise.all(
    Object.entries(source.examples.en ?? {}).map(
      async ([name, example]): Promise<Example | null> => {
        const prefix = "apps/docs/src/demos/";
        if (!example.source.startsWith(prefix))
          throw new Error(`Unsafe upstream demo path: ${example.source}`);
        const file = canonicalDemoFile(example.source.slice(prefix.length)) as string;
        if (!/^en\/[a-z0-9/-]+\.tsx$/.test(file)) throw new Error(`Unsafe live demo path: ${file}`);
        let code: string;
        try {
          code = await readFile(path.join(directory, "src/demos", file), "utf8");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
          throw error;
        }
        return {
          name: canonicalExampleName(name) as string,
          file,
          exported: findDemoExport(code, file, example.exported),
          locale: "en",
        };
      },
    ),
  );
  return entries.filter((entry): entry is Example => entry !== null);
}

export async function generateLiveRegistry(
  directory = root,
  localized: LocalizedChoices = { cn: {} },
  { globalRegistry = true }: { globalRegistry?: boolean } = {},
): Promise<LiveManifest> {
  const source: SourceIndex = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const examples = await discoverLiveExamples(directory, source);
  if (new Set(examples.map((example) => example.name)).size !== examples.length)
    throw new Error("Canonical public example names collide.");
  const manifest: LiveManifest = {
    en: Object.fromEntries(examples.map(({ name, file }) => [name, file])),
    cn: {},
  };
  for (const { name, file } of examples) {
    const counterpart = file.replace(/^en\//, "cn/");
    try {
      await access(path.join(directory, "src/demos", counterpart));
      manifest.cn[name] = counterpart;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  Object.assign(manifest.cn, localized.cn);
  for (const [name, file] of Object.entries(manifest.cn)) {
    if (!manifest.en[name]) throw new Error(`Chinese live demo has no English adaptation: ${name}`);
    if (!/^(en|cn)\/[a-z0-9/-]+\.tsx$/.test(file))
      throw new Error(`Unsafe localized live demo path: ${file}`);
    if (file.startsWith("en/") && file !== manifest.en[name])
      throw new Error(`Chinese reuse must refer to the matching English demo: ${name}`);
    examples.push({
      name,
      file,
      exported: findDemoExport(
        await readFile(path.join(directory, "src/demos", file), "utf8"),
        file,
        examples.find((example) => example.name === name)?.exported,
      ),
      locale: "cn",
    });
  }
  await writeFile(
    path.join(directory, "src/demos/live-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  // Document modules supply their own demos. Keep the full tooling dispatcher
  // available for production generation without formatting it on every dev start.
  if (!globalRegistry) return manifest;
  const modules = new Map<string, number>();
  const imports: string[] = [];
  const entries: Record<"en" | "cn", string[]> = { en: [], cn: [] };
  for (const { name, file, exported, locale } of examples) {
    const identity = `${file}:${exported}`;
    let index = modules.get(identity);
    if (index === undefined) {
      index = modules.size;
      modules.set(identity, index);
      imports.push(
        `const Demo${index} = dynamic(() => import(${JSON.stringify(`./${file.slice(0, -4)}`)}).then((module) => {
  const Component = module.${exported};
  return function MountedExample() {
    return createElement(Fragment, null, createElement(Component), createElement("span", { hidden: true, "data-example-mounted": ${JSON.stringify(file)} }));
  };
}), { ssr: false });`,
      );
    }
    entries[locale].push(`  ${JSON.stringify(name)}: Demo${index},`);
  }
  await writeFile(
    path.join(directory, "src/demos/generated.ts"),
    (
      await format(
        "generated.ts",
        `// Generated from maintained local modules. Do not edit.\n"use client";\nimport dynamic from "next/dynamic";\nimport { createElement, Fragment, type ComponentType } from "react";\n${imports.join("\n")}\n\nexport const demosByLocale: Record<"en" | "cn", Record<string, ComponentType>> = {\nen: {\n${entries.en.join("\n")}\n},\ncn: {\n${entries.cn.join("\n")}\n},\n};\nexport const demos = demosByLocale.en;\n`,
        { printWidth: 100 },
      )
    ).code,
  );
  return manifest;
}
