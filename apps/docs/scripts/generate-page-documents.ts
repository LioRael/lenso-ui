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
import { canonicalExampleName } from "./docs-projection.mjs";
import { searchMarkdown } from "./static-search.mjs";
import { nativeApiFamily } from "../src/lib/native-api-section.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
type Page = { locale: DemoLocale; slug: string; markdownFile: string };
type MdxNode = {
  type: string;
  name?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: MdxNode[];
  data?: { estree?: unknown };
};

let documentProcessor: Promise<{ parse(markdown: string): MdxNode }> | undefined;

// Use the same MDX parser as the documentation compiler, including its JSX grammar.
export async function documentReferences(markdown: string): Promise<{
  previews: string[];
  components: string[];
}> {
  documentProcessor ??= (async () => {
    const require = createRequire(new URL("../../../packages/docs/package.json", import.meta.url));
    const { createProcessor } = await import(pathToFileURL(require.resolve("@mdx-js/mdx")).href);
    return createProcessor();
  })();
  const tree = (await documentProcessor).parse(
    markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ""),
  );
  const names = new Set<string>();
  const components = new Set<string>();
  function visitExpression(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visitExpression);
      return;
    }
    const node = value as {
      type?: string;
      name?: { type?: string; name?: string };
      attributes?: {
        type?: string;
        name?: { name?: string };
        value?: { type?: string; value?: unknown };
      }[];
    };
    if (node.type === "JSXOpeningElement" && node.name?.type === "JSXIdentifier") {
      const name = node.name.name!;
      components.add(name);
      if (name === "ComponentPreview") {
        const attribute = node.attributes?.find((attribute) => attribute.name?.name === "name");
        if (attribute?.value?.type !== "Literal" || typeof attribute.value.value !== "string")
          throw new Error(
            "ComponentPreview requires a literal name for page-local demo generation.",
          );
        names.add(attribute.value.value);
      }
    }
    Object.values(value).forEach(visitExpression);
  }
  function visit(node: MdxNode) {
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (node.name) components.add(node.name);
      if (node.name === "ComponentPreview") {
        const name = node.attributes?.find((attribute) => attribute.name === "name");
        if (!name || typeof name.value !== "string")
          throw new Error(
            "ComponentPreview requires a literal name for page-local demo generation.",
          );
        names.add(name.value);
      }
      for (const attribute of node.attributes ?? []) visitExpression(attribute.value);
    }
    visitExpression(node.data?.estree);
    node.children?.forEach(visit);
  }
  visit(tree);
  return { previews: [...names], components: [...components] };
}

export async function previewNames(markdown: string): Promise<string[]> {
  return (await documentReferences(markdown)).previews;
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

export async function generatePageDocuments(
  directory = root,
  { pageIds }: { pageIds?: string[] } = {},
): Promise<string[]> {
  const index: { pages: Page[] } = JSON.parse(
    await readFile(path.join(directory, "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const manifest: LiveManifest = JSON.parse(
    await readFile(path.join(directory, "src/demos/live-manifest.json"), "utf8"),
  );
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const pages = pageIds
    ? index.pages.filter((page) => pageIds.includes(`${page.locale}/${page.slug}`))
    : index.pages;
  const previews = new Map<string, string[]>();
  const pageComponents = new Map<string, string[]>();
  for (const page of pages) {
    if (page.locale !== "en" && page.locale !== "cn")
      throw new Error(`Unsupported document locale: ${page.locale}`);
    safeRelative(page.slug);
    safeRelative(page.markdownFile);
    const references = await documentReferences(
      searchMarkdown(
        await readFile(path.join(directory, page.markdownFile), "utf8"),
        nativeApiFamily(page.slug),
      ),
    );
    previews.set(`${page.locale}/${page.slug}`, references.previews);
    pageComponents.set(`${page.locale}/${page.slug}`, references.components);
  }
  const wanted = new Set([...previews.values()].flat());
  const discovered = await discoverLiveExamples(directory, {
    ...source,
    examples: {
      ...source.examples,
      en: Object.fromEntries(
        Object.entries(source.examples.en).filter(([name]) =>
          wanted.has(canonicalExampleName(name)),
        ),
      ),
    },
  });
  const preferred = new Map(discovered.map((example) => [example.name, example.exported]));
  const exports = new Map<string, string>();
  const outputs = new Map<string, string>();
  for (const page of pages) {
    if (page.locale !== "en" && page.locale !== "cn")
      throw new Error(`Unsupported document locale: ${page.locale}`);
    safeRelative(page.slug);
    safeRelative(page.markdownFile);
    const server = `src/generated/documents/${page.locale}/${page.slug}.tsx`;
    if (outputs.has(server)) throw new Error(`Duplicate document: ${server}`);
    const client = server.replace(/\.tsx$/, ".client.tsx");
    const names = previews.get(`${page.locale}/${page.slug}`)!;
    const tags = new Set(pageComponents.get(`${page.locale}/${page.slug}`)!);
    const imports: string[] = [];
    const extensions: string[] = [];
    const colors = [
      "ColorSectionSideBySide",
      "ColorSectionStacked",
      "ColorSectionFormField",
      "ColorSectionPrimitive",
    ].filter((tag) => tags.has(tag));
    if (colors.length) {
      imports.push(
        `import { ${colors.join(", ")} } from ${JSON.stringify(relativeImport(server, "src/components/color-section"))};`,
      );
      extensions.push(...colors);
    }
    if (tags.has("ComponentsCategory")) {
      imports.push(
        `import { ComponentsCategory } from ${JSON.stringify(relativeImport(server, "src/components/components-category"))};`,
        `import { source } from ${JSON.stringify(relativeImport(server, "src/lib/source"))};`,
      );
      extensions.push(
        `ComponentsCategory: ({ category }: { category: string }) => <ComponentsCategory pages={source.pages.filter((page) => page.locale === ${JSON.stringify(page.locale)} && page.slug.startsWith("react/components/") && page.componentCategory === category)} />`,
      );
    }
    if (tags.has("NativeApiReference") || nativeApiFamily(page.slug)) {
      imports.push(
        `import { NativeApiReference } from ${JSON.stringify(relativeImport(server, "src/components/native-api-reference"))};`,
      );
      extensions.push("NativeApiReference");
    }
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
      let exported = exports.get(`${file}:${preferred.get(name) ?? ""}`);
      if (!exported) {
        exported = findDemoExport(
          await readFile(path.join(directory, "src/demos", file), "utf8"),
          file,
          preferred.get(name),
        );
        exports.set(`${file}:${preferred.get(name) ?? ""}`, exported);
      }
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
${imports.join("\n")}
${refs ? `import { ${refs} } from ${JSON.stringify(relativeImport(server, client.slice(0, -4)))};` : ""}
${
  names.length
    ? `import type { ComponentProps, ComponentType } from "react";
import { ComponentPreview } from ${JSON.stringify(relativeImport(server, "src/components/component-preview"))};
const demos: Record<string, ComponentType> = { ${entries.join(", ")} };
`
    : ""
}
const overrides = {
${extensions.join(",\n")}${extensions.length && names.length ? "," : ""}
${
  names.length
    ? `
  ComponentPreview: (props: ComponentProps<typeof ComponentPreview>) =>
    <ComponentPreview {...props} locale=${JSON.stringify(page.locale)} Preview={demos[props.name]} />,
`
    : ""
}
};
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
    const affected =
      !pageIds ||
      pageIds.some(
        (id) => relative === `${owned}/${id}.tsx` || relative === `${owned}/${id}.client.tsx`,
      );
    if (affected && file.endsWith(".tsx") && !outputs.has(relative))
      await unlink(path.join(directory, relative));
  }
  return [...outputs.keys()];
}
