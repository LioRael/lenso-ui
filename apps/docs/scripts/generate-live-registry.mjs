import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const root = fileURLToPath(new URL("../", import.meta.url));
export function findDemoExport(code, filename, preferred) {
  const ast = parse(code, {
    sourceType: "module",
    sourceFilename: filename,
    plugins: ["typescript", "jsx"],
  });
  const candidates = [];
  for (const node of ast.program.body) {
    if (node.type === "ExportDefaultDeclaration") {
      candidates.push("default");
      continue;
    }
    if (node.type !== "ExportNamedDeclaration" || node.exportKind === "type") continue;
    const declaration = node.declaration;
    if (declaration?.type === "FunctionDeclaration") candidates.push(declaration.id.name);
    else if (declaration?.type === "VariableDeclaration") {
      for (const variable of declaration.declarations) {
        if (variable.id.type !== "Identifier") continue;
        const init = variable.init;
        if (
          init?.type === "ArrowFunctionExpression" ||
          init?.type === "FunctionExpression" ||
          (init?.type === "CallExpression" &&
            ["memo", "forwardRef"].includes(init.callee.property?.name ?? init.callee.name))
        )
          candidates.push(variable.id.name);
      }
    }
    for (const specifier of node.specifiers) {
      if (specifier.type === "ExportSpecifier" && specifier.exportKind !== "type")
        candidates.push(specifier.exported.name ?? specifier.exported.value);
    }
  }
  const exported = candidates.includes(preferred) ? preferred : candidates[0];
  if (!exported) throw new Error(`No exported live demo in ${filename}`);
  return exported;
}

export async function discoverLiveExamples(directory, source) {
  const entries = await Promise.all(
    Object.entries(source.examples.en).map(async ([name, example]) => {
      const prefix = "apps/docs/src/demos/";
      if (!example.source.startsWith(prefix))
        throw new Error(`Unsafe upstream demo path: ${example.source}`);
      const file = example.source.slice(prefix.length);
      if (!/^en\/[a-z0-9/-]+\.tsx$/.test(file)) throw new Error(`Unsafe live demo path: ${file}`);
      let code;
      try {
        code = await readFile(path.join(directory, "src/demos", file), "utf8");
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
      const exported = findDemoExport(code, file, example.exported);
      return { name, file, exported };
    }),
  );
  return entries.filter((entry) => entry !== null);
}

export async function generateLiveRegistry(directory = root) {
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const examples = await discoverLiveExamples(directory, source);
  const manifest = Object.fromEntries(examples.map(({ name, file }) => [name, file]));
  const modules = new Map();
  const imports = [];
  const entries = [];
  for (const { name, file, exported } of examples) {
    let index = modules.get(file);
    if (index === undefined) {
      index = modules.size;
      modules.set(file, index);
      imports.push(
        `const Demo${index} = dynamic(() => import(${JSON.stringify(`./${file.slice(0, -4)}`)}).then((module) => {
  const Component = module.${exported};
  return function MountedExample() {
    return createElement(Fragment, null, createElement(Component), createElement("span", { hidden: true, "data-example-mounted": ${JSON.stringify(file)} }));
  };
}), { ssr: false });`,
      );
    }
    entries.push(`  ${JSON.stringify(name)}: Demo${index},`);
  }
  await Promise.all([
    writeFile(
      path.join(directory, "src/demos/live-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    writeFile(
      path.join(directory, "src/demos/generated.ts"),
      `// Generated from pinned source paths and existing local modules. Do not edit.\n"use client";\nimport dynamic from "next/dynamic";\nimport { createElement, Fragment, type ComponentType } from "react";\n${imports.join("\n")}\n\nexport const demos: Record<string, ComponentType> = {\n${entries.join("\n")}\n};\n`,
    ),
  ]);
  console.log(`${entries.length} live references (${modules.size} independently loaded modules).`);
  return manifest;
}
