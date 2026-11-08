import { access, readFile } from "node:fs/promises";
import { writeGeneratedFile } from "./write-generated-file.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import type { Node } from "@babel/types";
import { format } from "oxfmt";
import {
  canonicalDemoFile,
  canonicalExampleName,
  isCustomStyleExample,
  isRetiredExample,
} from "./docs-projection.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
type SourceEntry = { source: string; file?: string; exported?: string };
type ExampleCatalog = { examples: Record<string, Record<string, SourceEntry>> };
export type LiveManifest = { en: Record<string, string>; cn: Record<string, string> };
export type LocalizedChoices = Pick<LiveManifest, "cn">;
type Example = { name: string; file: string; exported: string; locale: "en" | "cn" };

export function findDemoExport(code: string, filename: string, preferred?: string): string {
  const source = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    sourceFilename: filename,
  });
  const candidates: string[] = [];
  const bindings = new Map<string, Node>();
  const callable = (node: Node | null | undefined): boolean =>
    !!node &&
    ((node.type === "FunctionDeclaration" && !!node.body && !node.declare) ||
      node.type === "ClassDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression" ||
      node.type === "ClassExpression" ||
      (node.type === "CallExpression" &&
        ((node.callee.type === "Identifier" && ["memo", "forwardRef"].includes(node.callee.name)) ||
          (node.callee.type === "MemberExpression" &&
            node.callee.property.type === "Identifier" &&
            ["memo", "forwardRef"].includes(node.callee.property.name)))));
  for (const statement of source.program.body) {
    const declaration =
      statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
    if (!declaration) continue;
    if (
      (declaration.type === "FunctionDeclaration" ||
        declaration.type === "ClassDeclaration" ||
        declaration.type === "TSDeclareFunction") &&
      declaration.id
    )
      bindings.set(declaration.id.name, declaration);
    if (declaration.type === "VariableDeclaration")
      for (const item of declaration.declarations)
        if (item.id.type === "Identifier" && item.init) bindings.set(item.id.name, item.init);
  }
  for (const statement of source.program.body) {
    if (statement.type === "ExportDefaultDeclaration") {
      const item = statement.declaration;
      if (callable(item.type === "Identifier" ? bindings.get(item.name) : item))
        candidates.push("default");
    } else if (statement.type === "ExportNamedDeclaration" && statement.exportKind !== "type") {
      const declaration = statement.declaration;
      if (
        (declaration?.type === "FunctionDeclaration" || declaration?.type === "ClassDeclaration") &&
        declaration.id &&
        callable(declaration)
      )
        candidates.push(declaration.id.name);
      if (declaration?.type === "VariableDeclaration")
        for (const item of declaration.declarations)
          if (item.id.type === "Identifier" && callable(item.init)) candidates.push(item.id.name);
      for (const item of statement.specifiers)
        if (item.type === "ExportSpecifier" && item.exportKind !== "type") {
          const local = item.local.name;
          const name =
            item.exported.type === "Identifier" ? item.exported.name : item.exported.value;
          if (!bindings.has(local) || callable(bindings.get(local))) candidates.push(name);
        }
    }
  }
  const exported = preferred && candidates.includes(preferred) ? preferred : candidates[0];
  if (!exported) throw new Error(`No exported live demo in ${filename}`);
  return exported;
}

export async function discoverLiveExamples(
  directory: string,
  source: ExampleCatalog,
): Promise<Example[]> {
  const entries = await Promise.all(
    Object.entries(source.examples.en ?? {}).map(
      async ([name, example]): Promise<Example | null> => {
        if (isCustomStyleExample(name) || isRetiredExample(name)) return null;
        const prefix = "apps/docs/src/demos/";
        if (!example.source.startsWith(prefix))
          throw new Error(`Unsafe demo path: ${example.source}`);
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
  const source: ExampleCatalog = JSON.parse(
    await readFile(path.join(directory, "content/example-catalog.json"), "utf8"),
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
  await writeGeneratedFile(
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
  await writeGeneratedFile(
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
