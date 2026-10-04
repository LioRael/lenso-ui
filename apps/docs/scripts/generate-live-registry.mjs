import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import { format } from "oxfmt";
import { createHash } from "node:crypto";
import { canonicalDemoFile, canonicalExampleName } from "./docs-projection.mjs";
import {
  sourcePins,
  verifyDisclosureInputs,
  verifyDisclosureOutputs,
  verifyDisclosureProvenance,
} from "./capture-disclosure-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
export function findDemoExport(code, filename, preferred) {
  const ast = parse(code, {
    sourceType: "module",
    sourceFilename: filename,
    plugins: ["typescript", "jsx"],
  });
  const candidates = [];
  const callable = (node) =>
    [
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression",
      "ClassDeclaration",
      "ClassExpression",
    ].includes(node?.type) ||
    (node?.type === "CallExpression" &&
      ["memo", "forwardRef"].includes(node.callee.property?.name ?? node.callee.name));
  const bindings = new Map();
  for (const statement of ast.program.body) {
    const declaration = statement.declaration ?? statement;
    if (
      (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") &&
      declaration.id
    )
      bindings.set(declaration.id.name, declaration);
    if (declaration.type === "VariableDeclaration")
      for (const variable of declaration.declarations)
        if (variable.id.type === "Identifier") bindings.set(variable.id.name, variable.init);
  }
  for (const node of ast.program.body) {
    if (node.type === "ExportDefaultDeclaration") {
      const declaration =
        node.declaration.type === "Identifier"
          ? bindings.get(node.declaration.name)
          : node.declaration;
      if (callable(declaration)) candidates.push("default");
      continue;
    }
    if (node.type !== "ExportNamedDeclaration" || node.exportKind === "type") continue;
    const declaration = node.declaration;
    if (declaration?.type === "FunctionDeclaration" || declaration?.type === "ClassDeclaration")
      candidates.push(declaration.id.name);
    else if (declaration?.type === "VariableDeclaration") {
      for (const variable of declaration.declarations) {
        if (variable.id.type !== "Identifier") continue;
        const init = variable.init;
        if (callable(init)) candidates.push(variable.id.name);
      }
    }
    for (const specifier of node.specifiers) {
      if (
        specifier.type === "ExportSpecifier" &&
        specifier.exportKind !== "type" &&
        (!bindings.has(specifier.local.name) || callable(bindings.get(specifier.local.name)))
      )
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
      const file = canonicalDemoFile(example.source.slice(prefix.length));
      if (!/^en\/[a-z0-9/-]+\.tsx$/.test(file)) throw new Error(`Unsafe live demo path: ${file}`);
      let code;
      try {
        code = await readFile(path.join(directory, "src/demos", file), "utf8");
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
      const exported = findDemoExport(code, file, example.exported);
      return { name: canonicalExampleName(name), file, exported };
    }),
  );
  return entries.filter((entry) => entry !== null);
}

export async function generateLiveRegistry(directory = root, localized) {
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const examples = await discoverLiveExamples(directory, source);
  const names = examples.map((example) => example.name);
  if (new Set(names).size !== names.length)
    throw new Error(
      "Canonical public example names collide; preserve raw references in private provenance.",
    );
  const manifest = {
    en: Object.fromEntries(examples.map(({ name, file }) => [name, file])),
    cn: localized?.cn ?? {},
  };
  const provenance = Object.keys(manifest.cn).length
    ? JSON.parse(
        await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
      )
    : null;
  if (Object.values(manifest.cn).some((file) => sourcePins[file])) {
    await verifyDisclosureInputs(directory);
    await verifyDisclosureOutputs(directory);
    await verifyDisclosureProvenance(directory, provenance.modules);
  }
  for (const [name, file] of Object.entries(manifest.cn)) {
    if (!manifest.en[name]) throw new Error(`Chinese live demo has no English adaptation: ${name}`);
    if (!/^(en|cn)\/[a-z0-9/-]+\.tsx$/.test(file))
      throw new Error(`Unsafe localized live demo path: ${file}`);
    const evidence = provenance.modules[manifest.en[name]];
    const reuse = ["identical-pinned-source-reuse", "equivalent-pinned-source-ast-reuse"].includes(
      evidence?.status,
    );
    if (
      !evidence ||
      (file.startsWith("en/")
        ? !reuse || file !== manifest.en[name]
        : !["source-backed-localized", "lenso-authored-localized"].includes(evidence.status) ||
          file !== evidence.output)
    )
      throw new Error(`Chinese live demo lacks source-backed provenance: ${name}`);
    const code = await readFile(path.join(directory, "src/demos", file), "utf8");
    if (
      file.startsWith("cn/") &&
      evidence.outputSha256 !== createHash("sha256").update(code).digest("hex")
    )
      throw new Error(`Chinese live demo differs from its source-backed projection: ${name}`);
    examples.push({
      name,
      file,
      exported: findDemoExport(
        code,
        file,
        examples.find((example) => example.name === name && example.file === manifest.en[name])
          ?.exported,
      ),
      locale: "cn",
    });
  }
  const modules = new Map();
  const imports = [];
  const entries = { en: [], cn: [] };
  for (const { name, file, exported, locale = "en" } of examples) {
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
  await Promise.all([
    writeFile(
      path.join(directory, "src/demos/live-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    writeFile(
      path.join(directory, "src/demos/live-source-provenance.json"),
      `${JSON.stringify(
        {
          method:
            "Raw source references map to canonical public names; archive identifiers are not runtime aliases.",
          examples: Object.fromEntries(
            ["en", "cn"].map((locale) => [
              locale,
              Object.fromEntries(
                Object.entries(source.examples[locale] ?? {}).map(([rawSourceRef, entry]) => [
                  canonicalExampleName(rawSourceRef),
                  {
                    rawSourceRef,
                    source: entry.source,
                    archive: entry.file,
                    localFile: manifest[locale][canonicalExampleName(rawSourceRef)] ?? null,
                  },
                ]),
              ),
            ]),
          ),
        },
        null,
        2,
      )}\n`,
    ),
    writeFile(
      path.join(directory, "src/demos/generated.ts"),
      (
        await format(
          "generated.ts",
          `// Generated from pinned source paths and existing local modules. Do not edit.\n"use client";\nimport dynamic from "next/dynamic";\nimport { createElement, Fragment, type ComponentType } from "react";\n${imports.join("\n")}\n\nexport const demosByLocale: Record<"en" | "cn", Record<string, ComponentType>> = {\nen: {\n${entries.en.join("\n")}\n},\ncn: {\n${entries.cn.join("\n")}\n},\n};\nexport const demos = demosByLocale.en;\n`,
          { printWidth: 100 },
        )
      ).code,
    ),
  ]);
  console.log(
    `${entries.en.length} EN and ${entries.cn.length} CN live references (${modules.size} independently loaded modules).`,
  );
  return manifest;
}
