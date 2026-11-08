import path from "node:path";
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import type { Root, RootContent } from "mdast";
import type { VFile } from "vfile";
import {
  headingText,
  nativeApiFamily,
  replaceNativeApiSection,
} from "../src/lib/native-api-section.ts";
import { headingId } from "../src/lib/heading-id.ts";
export function remarkLensoDocument() {
  return (tree: Root, file: VFile) => {
    const index: { pages: { markdownFile: string; slug: string; locale: string }[] } = JSON.parse(
      readFileSync(new URL("../src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
    );
    const relative = path
      .relative(path.resolve(import.meta.dirname, "../content/lenso"), file.path)
      .split(path.sep)
      .join("/");
    const page = index.pages.find((page) => page.markdownFile === "content/lenso/" + relative);
    if (!page) throw new Error(`Missing document metadata: ${relative}`);
    const family = nativeApiFamily(page.slug);
    if (family) replaceNativeApiSection(tree, family, page.locale === "cn" ? "zh" : "en");
    const headings: { title: string; id: string; depth: number }[] = [];
    const visit = (node: RootContent) => {
      if (node.type === "heading") {
        const title = headingText(node);
        const id = headingId(title);
        const data = node.data as { hProperties?: Record<string, unknown> } | undefined;
        Object.assign((node.data ??= {}), { hProperties: { ...data?.hProperties, id } });
        if (node.depth >= 2 && node.depth <= 4 && (node.depth !== 4 || title.includes("[!toc]")))
          headings.push({ title: title.replace(/\[!toc\]/g, "").trim(), id, depth: node.depth });
      }
      if ("name" in node && node.name === "NativeApiReference")
        headings.push({
          title: page.locale === "cn" ? "API 参考" : "API Reference",
          id: "native-api-" + family,
          depth: 2,
        });
      if ("children" in node) for (const child of node.children) visit(child as RootContent);
    };
    for (const child of tree.children) visit(child);
    const components = path.resolve(
      import.meta.dirname,
      "../src/generated/documents",
      page.locale,
      page.slug + ".tsx",
    );
    let target = path.relative(path.dirname(file.path), components).split(path.sep).join("/");
    if (!target.startsWith(".")) target = "./" + target;
    const code = `export {getComponents} from ${JSON.stringify(target)};\nexport const lensoHeadings=${JSON.stringify(headings)};`;
    tree.children.unshift({
      type: "mdxjsEsm",
      value: code,
      data: { estree: parse(code, { sourceType: "module", plugins: ["estree"] }).program },
    } as RootContent);
  };
}
