import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { format } from "oxfmt";
import {
  discoverLiveExamples,
  findDemoExport,
  type LiveManifest,
} from "./generate-live-registry.ts";
import { resolveDemo, type DemoLocale } from "../src/lib/demo-locale.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
type Page = { locale: DemoLocale; slug: string; markdownFile: string };
type MdxNode = {
  type: string;
  name?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: MdxNode[];
};

// Use the same MDX parser as the documentation compiler, including its JSX grammar.
export async function previewNames(markdown: string): Promise<string[]> {
  const require = createRequire(new URL("../../../packages/docs/package.json", import.meta.url));
  const { createProcessor } = await import(pathToFileURL(require.resolve("@mdx-js/mdx")).href);
  const tree: MdxNode = createProcessor().parse(
    markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ""),
  );
  const names = new Set<string>();
  function visit(node: MdxNode) {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "ComponentPreview"
    ) {
      const name = node.attributes?.find((attribute) => attribute.name === "name");
      if (!name || typeof name.value !== "string")
        throw new Error("ComponentPreview requires a literal name for page-local demo generation.");
      names.add(name.value);
    }
    node.children?.forEach(visit);
  }
  visit(tree);
  return [...names];
}

function safeRelative(file: string) {
  if (
    !/^[a-z0-9][a-z0-9./-]*$/.test(file) ||
    file.split("/").some((segment) => !segment || segment === "." || segment === "..")
  )
    throw new Error(`Unsafe document path: ${file}`);
}

function relativeImport(from: string, to: string) {
  const relative = path.relative(path.dirname(from), to).split(path.sep).join("/");
  return relative.startsWith(".") ? relative : `./${relative}`;
}

export async function generatePageDocuments(directory = root): Promise<string[]> {
  const index: { pages: Page[] } = JSON.parse(
    await readFile(path.join(directory, "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const manifest: LiveManifest = JSON.parse(
    await readFile(path.join(directory, "src/demos/live-manifest.json"), "utf8"),
  );
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const discovered = await discoverLiveExamples(directory, source);
  const preferred = new Map(discovered.map((example) => [example.name, example.exported]));
  const outputs = new Map<string, string>();
  for (const page of index.pages) {
    if (page.locale !== "en" && page.locale !== "cn")
      throw new Error(`Unsupported document locale: ${page.locale}`);
    safeRelative(page.slug);
    safeRelative(page.markdownFile);
    const server = `src/generated/documents/${page.locale}/${page.slug}.tsx`;
    if (outputs.has(server)) throw new Error(`Duplicate document: ${server}`);
    const client = server.replace(/\.tsx$/, ".client.tsx");
    const names = await previewNames(
      await readFile(path.join(directory, page.markdownFile), "utf8"),
    );
    const identities = new Map<string, number>();
    const wrappers: string[] = [];
    const entries: string[] = [];
    for (const name of names) {
      const resolved = resolveDemo(manifest, name, page.locale);
      if (!resolved) continue;
      const file = resolved.file;
      if (
        !/^(en|cn)\/[a-z0-9/-]+\.tsx$/.test(file) ||
        file.split("/").some((segment) => segment === "..")
      )
        throw new Error(`Unsafe page demo path: ${file}`);
      const exported = findDemoExport(
        await readFile(path.join(directory, "src/demos", file), "utf8"),
        file,
        preferred.get(name),
      );
      const identity = `${file}:${exported}`;
      let id = identities.get(identity);
      if (id === undefined) {
        id = identities.size;
        identities.set(identity, id);
        const target = relativeImport(client, `src/demos/${file.slice(0, -4)}`);
        wrappers.push(`export const Demo${id} = dynamic(() => import(${JSON.stringify(target)}).then((module) => {
  const Component = module[${JSON.stringify(exported)}];
  return function MountedExample() {
    return createElement(Fragment, null, createElement(Component), createElement("span", { hidden: true, "data-example-mounted": ${JSON.stringify(file)} }));
  };
}), { ssr: false });`);
      }
      entries.push(`${JSON.stringify(name)}: Demo${id}`);
    }
    const refs = [...identities.values()].map((id) => `Demo${id}`).join(", ");
    if (wrappers.length)
      outputs.set(
        client,
        `"use client";
import dynamic from "next/dynamic";
import { createElement, Fragment } from "react";
${wrappers.join("\n")}
`,
      );
    outputs.set(
      server,
      `// Generated page-local document. Do not edit.
import type { DocumentationCustomizationContext } from "@lenso/docs/react";
import { getDocument as document, getComponents as components } from ${JSON.stringify(relativeImport(server, "docs.document"))};
${refs ? `import { ${refs} } from ${JSON.stringify(relativeImport(server, client.slice(0, -4)))};` : ""}
${
  names.length
    ? `import type { ComponentProps, ComponentType } from "react";
import { ComponentPreview } from ${JSON.stringify(relativeImport(server, "src/components/component-preview"))};
const demos: Record<string, ComponentType> = { ${entries.join(", ")} };
const overrides = {
  ComponentPreview: (props: ComponentProps<typeof ComponentPreview>) =>
    <ComponentPreview {...props} locale=${JSON.stringify(page.locale)} Preview={demos[props.name]} />,
};`
    : "const overrides = {};"
}
export function getDocument(context: DocumentationCustomizationContext) { return document(context, overrides); }
export function getComponents(context: DocumentationCustomizationContext) { return components(context, overrides); }
`,
    );
  }
  // Stage every page before writing so invalid input cannot leave a partial projection.
  for (const [file, code] of outputs) {
    const formatted = (await format(file, code, { printWidth: 100 })).code;
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    let current: string | undefined;
    try {
      current = await readFile(target, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (current !== formatted) await writeFile(target, formatted);
  }
  const owned = "src/generated/documents";
  await mkdir(path.join(directory, owned), { recursive: true });
  for (const file of await readdir(path.join(directory, owned), { recursive: true })) {
    const relative = `${owned}/${file.split(path.sep).join("/")}`;
    if (file.endsWith(".tsx") && !outputs.has(relative))
      await unlink(path.join(directory, relative));
  }
  return [...outputs.keys()];
}
