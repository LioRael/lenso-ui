import { mkdir, readFile, readdir, unlink } from "node:fs/promises";
import { writeGeneratedFile } from "./write-generated-file.ts";
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
import {
  canonicalExampleName,
  playgroundExamples,
  examplePresentation,
} from "./docs-projection.ts";
import { searchMarkdown } from "./static-search.ts";
import { nativeApiFamily } from "../src/lib/native-api-section.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
type Page = {
  locale: DemoLocale;
  slug: string;
  markdownFile: string;
  examples?: { name: string; file: string }[];
};
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
  stories: string[];
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
  const stories = new Set<string>();
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
      if (name === "ComponentPlayground") {
        const attribute = node.attributes?.find((attribute) => attribute.name?.name === "family");
        if (attribute?.value?.type !== "Literal" || typeof attribute.value.value !== "string")
          throw new Error("ComponentPlayground requires a literal family.");
        stories.add(attribute.value.value);
      }
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
      if (node.name === "ComponentPlayground") {
        const family = node.attributes?.find((attribute) => attribute.name === "family");
        if (typeof family?.value !== "string")
          throw new Error("ComponentPlayground requires a literal family.");
        stories.add(family.value);
      }
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
  return { previews: [...names], components: [...components], stories: [...stories] };
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
    await readFile(path.join(directory, "content/example-catalog.json"), "utf8"),
  );
  const pages = pageIds
    ? index.pages.filter((page) => pageIds.includes(`${page.locale}/${page.slug}`))
    : index.pages;
  const previews = new Map<string, string[]>();
  const pageComponents = new Map<string, string[]>();
  const pageStories = new Map<string, string[]>();
  const pageScenarios = new Map<string, { name: string; file: string }[]>();
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
    const scenarios = references.stories.length
      ? playgroundExamples(page.examples ?? [], references.stories[0]!)
      : [];
    pageScenarios.set(`${page.locale}/${page.slug}`, scenarios);
    previews.set(`${page.locale}/${page.slug}`, [
      ...new Set([...references.previews, ...scenarios.map(({ name }) => name)]),
    ]);
    pageComponents.set(`${page.locale}/${page.slug}`, references.components);
    pageStories.set(`${page.locale}/${page.slug}`, references.stories);
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
  const { localExampleFiles } = await import("../src/lib/local-example-files.ts");
  let api:
    | {
        families: Record<string, { parts: { properties: number[]; [key: string]: unknown }[] }>;
        properties: unknown[];
      }
    | undefined;
  let storySources: Record<string, string> | undefined;
  const sourceCache = new Map<string, ReturnType<typeof localExampleFiles>>();
  const sourcesFor = (entry: string) => {
    let files = sourceCache.get(entry);
    if (!files) {
      files = localExampleFiles(entry, directory);
      sourceCache.set(entry, files);
    }
    return files;
  };
  for (const page of pages) {
    if (page.locale !== "en" && page.locale !== "cn")
      throw new Error(`Unsupported document locale: ${page.locale}`);
    safeRelative(page.slug);
    safeRelative(page.markdownFile);
    const server = `src/generated/documents/${page.locale}/${page.slug}.tsx`;
    if (outputs.has(server)) throw new Error(`Duplicate document: ${server}`);
    const client = server.replace(/\.tsx$/, ".examples.tsx");
    const names = previews.get(`${page.locale}/${page.slug}`)!;
    const tags = new Set(pageComponents.get(`${page.locale}/${page.slug}`)!);
    const imports: string[] = [];
    const exampleSources: Record<string, { name: string; code: string }[]> = {};
    let playgroundSources: { file: string; code: string }[] = [];
    const sourcesFile = server.replace(/\.tsx$/, ".sources.ts");
    const extensions: string[] = [];
    let storyClient = "";
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
    if (tags.has("NativeApiReference")) {
      imports.push(
        `import { NativeApiReference } from ${JSON.stringify(relativeImport(server, "src/components/native-api-reference"))};`,
      );
      api ??= JSON.parse(
        await readFile(path.join(directory, "src/generated/api-reference.json"), "utf8"),
      );
      const family = nativeApiFamily(page.slug);
      const contract = family ? api!.families[family] : undefined;
      if (family && !contract) throw new Error(`Missing native API: ${family}`);
      const ids = contract
        ? [...new Set(contract.parts.flatMap((part) => part.properties))]
        : api!.properties.map((_, index) => index);
      const remap = new Map(ids.map((id, index) => [id, index]));
      const data = contract
        ? {
            families: {
              [family!]: {
                ...contract,
                parts: contract.parts.map((part) => ({
                  ...part,
                  properties: part.properties.map((id) => remap.get(id)!),
                })),
              },
            },
            properties: ids.map((id) => api!.properties[id]),
          }
        : api!;
      const apiFile = server.replace(/\.tsx$/, ".api.json");
      outputs.set(apiFile, JSON.stringify(data));
      imports.push(
        `import api from ${JSON.stringify(relativeImport(server, apiFile))};`,
        'import type {ComponentProps as ApiProps} from "react";',
      );
      extensions.push(
        `NativeApiReference:(props:Omit<ApiProps<typeof NativeApiReference>,"reference">)=><NativeApiReference {...props} reference={api}/>`,
      );
    }
    if (tags.has("ComponentPlayground")) {
      imports.push(
        `import { ComponentPlayground } from ${JSON.stringify(relativeImport(server, "src/components/component-playground"))};`,
      );
      const family = pageStories.get(`${page.locale}/${page.slug}`)?.[0];
      if (!family || !/^[a-z][a-z0-9-]*$/.test(family))
        throw new Error(`Story requires a component family: ${page.slug}`);
      storySources ??= JSON.parse(
        await readFile(path.join(directory, "src/stories/story-sources.json"), "utf8"),
      );
      const storyEntry = storySources![family];
      if (storyEntry) playgroundSources = await sourcesFor(storyEntry);
      storyClient = `import { story as pageStory } from ${JSON.stringify(relativeImport(client, `src/stories/${family}.story`))};
import { StoryLanguage, type StoryFile, type PlaygroundScenario } from ${JSON.stringify(relativeImport(client, "src/stories/story-panel"))};
export function PageStory({locale, loadFiles, scenarios}: {locale: "en" | "cn"; loadFiles?: () => Promise<StoryFile[]>; scenarios?: PlaygroundScenario[]}) {
  return <StoryLanguage locale={locale} loadFiles={loadFiles} scenarios={scenarios}><pageStory.WithControl /></StoryLanguage>;
}`;
      imports.push(
        `import { PageStory } from ${JSON.stringify(relativeImport(server, client.slice(0, -4)))};`,
      );
      extensions.push(
        `ComponentPlayground: () => <ComponentPlayground family=${JSON.stringify(family)} locale=${JSON.stringify(page.locale)} Preview={PageStory} loadFiles={() => loadSources().then(module=>module.playground())} scenarios={[${(pageScenarios.get(`${page.locale}/${page.slug}`) ?? []).map(({ name }) => `{id:${JSON.stringify(name)},title:${JSON.stringify(examplePresentation(name, family, page.locale).title)},${name === "menu-default" ? "initial:true," : ""}Preview:demos[${JSON.stringify(name)}]!,loadFiles:()=>loadSources().then(module=>module.examples[${JSON.stringify(name)}]!())}`).join(",")}]} />`,
      );
    }
    const identities = new Map<string, number>();
    const wrappers: string[] = [];
    const entries: string[] = [];
    for (const name of names) {
      const resolved = resolveDemo(manifest, name, page.locale);
      if (!resolved) continue;
      const file = resolved.file;
      exampleSources[name] = (await sourcesFor(file)).map(({ file, code }) => ({
        name: file,
        code,
      }));
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
        wrappers.push(`const Demo${id}Component = lazy(() => import(${JSON.stringify(target)}).then((module) => {
  const Component = module[${JSON.stringify(exported)}];
  return {default:function MountedExample() {
    return createElement(Fragment, null, createElement(Component), createElement("span", { hidden: true, "data-example-mounted": ${JSON.stringify(file)} }));
  }};
}));
export function Demo${id}(){ return <VisiblePreview><Suspense fallback={null}><Demo${id}Component/></Suspense></VisiblePreview> }`);
      }
      entries.push(`${JSON.stringify(name)}: Demo${id}`);
    }
    if (names.length || storyClient) {
      const files = [
        ...new Set([
          ...Object.values(exampleSources)
            .flat()
            .map((item) => item.name),
          ...playgroundSources.map((item) => item.file),
        ]),
      ];
      const sourceNames = new Map(files.map((file, index) => [file, `source${index}`]));
      const sourceImports = files
        .map(
          (file) =>
            `const ${sourceNames.get(file)}=()=>import(${JSON.stringify(relativeImport(sourcesFile, `src/demos/${file}`) + "?raw")}).then(module=>module.default);`,
        )
        .join("\n");
      const examples = Object.entries(exampleSources)
        .map(
          ([name, files]) =>
            `${JSON.stringify(name)}:()=>Promise.all([${files.map((file) => `${sourceNames.get(file.name)}().then(code=>({name:${JSON.stringify(file.name)},code}))`).join(",")}])`,
        )
        .join(",");
      const playground = playgroundSources
        .map(
          (file) =>
            `${sourceNames.get(file.file)}().then(code=>({file:${JSON.stringify(file.file)},code}))`,
        )
        .join(",");
      outputs.set(
        sourcesFile,
        `${sourceImports}\nexport const examples:Record<string,()=>Promise<{name:string;code:string}[]>>={${examples}};\nexport const playground=()=>Promise.all([${playground}]);\n`,
      );
    }
    const refs = [...identities.values()].map((id) => `Demo${id}`).join(", ");
    if (wrappers.length || storyClient)
      outputs.set(
        client,
        `"use client";
${wrappers.length ? `import {lazy,Suspense,createElement,Fragment} from "react";\nimport {VisiblePreview} from ${JSON.stringify(relativeImport(client, "src/components/visible-preview"))};` : ""}
${storyClient}
${wrappers.join("\n")}
`,
      );
    outputs.set(
      server,
      `// Generated page-local document components. Do not edit.
import {getMDXComponents} from ${JSON.stringify(relativeImport(server, "src/mdx-components"))};
${imports.join("\n")}
${refs ? `import { ${refs} } from ${JSON.stringify(relativeImport(server, client.slice(0, -4)))};` : ""}
${
  names.length
    ? `import type {ComponentProps,ComponentType} from "react";
import {ComponentPreview} from ${JSON.stringify(relativeImport(server, "src/components/component-preview"))};
const demos:Record<string,ComponentType>={${entries.join(",")}};`
    : ""
}
${names.length || storyClient ? `const loadSources=()=>import(${JSON.stringify(relativeImport(server, sourcesFile))});` : ""}
const overrides={
${extensions.join(",\n")}${extensions.length && names.length ? "," : ""}
${names.length ? `ComponentPreview:(props:ComponentProps<typeof ComponentPreview>)=><ComponentPreview {...props} locale=${JSON.stringify(page.locale)} Preview={demos[props.name]} loadFiles={()=>loadSources().then(module=>module.examples[props.name]?.()??[])}/>` : ""}
};
export function getComponents(){return getMDXComponents(${JSON.stringify(page.locale)},overrides);}
`,
    );
  }
  // Stage every page before writing so invalid input cannot leave a partial projection.
  for (const [file, code] of outputs) {
    const formatted = (await format(file, code, { printWidth: 100 })).code;
    const target = path.join(directory, file);
    await writeGeneratedFile(target, formatted);
  }
  const owned = "src/generated/documents";
  await mkdir(path.join(directory, owned), { recursive: true });
  for (const file of await readdir(path.join(directory, owned), { recursive: true })) {
    const relative = `${owned}/${file.split(path.sep).join("/")}`;
    const affected =
      !pageIds ||
      pageIds.some(
        (id) =>
          relative === `${owned}/${id}.tsx` ||
          relative === `${owned}/${id}.examples.tsx` ||
          relative === `${owned}/${id}.sources.ts` ||
          relative === `${owned}/${id}.api.json`,
      );
    if (affected && /\.(?:tsx|sources\.ts|api\.json)$/.test(file) && !outputs.has(relative))
      await unlink(path.join(directory, relative));
  }
  return [...outputs.keys()];
}
