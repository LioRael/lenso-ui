import type { Document } from "./index.ts";
import { renderContract } from "./renderers/exact.ts";

type CodeToken = { id: number; group: number; text: string; kind: string };
type Block = { id: number; template: number; strings: string[]; tokens: CodeToken[] };
export type PageContent = { path: string; markdown: string; blocks: Block[] };

/** Content stays data; native Contract templates keep widgets, slots and injection. */
export function compileBodies(
  documents: Pick<Document, "path" | "markdown" | "body">[],
  components: Record<string, string>,
) {
  const templates: string[] = [],
    indices = new Map<string, number>();
  const pages = new Map<string, PageContent>();
  for (const doc of documents) {
    if (doc.markdown === undefined) continue;
    const blocks = (doc.body ?? []).map((node, id): Block => {
      const strings: string[] = [],
        tokens: CodeToken[] = [];
      let group = 0;
      const string = (text: string) => {
        strings.push(text);
        return `docsString(block.strings, ${strings.length - 1})`;
      };
      const source = renderContract([node], components, {
        string,
        code(node, indent) {
          const current = group++;
          for (const token of node.tokens ?? [{ text: node.value, kind: "plain" }])
            tokens.push({ id: tokens.length, group: current, text: token.text, kind: token.kind });
          return `${indent}text data-docs-part="code" data-docs-language=${string(node.language)} white-space="pre-wrap"\n${indent}  for token in block.tokens.filter(item => item.group == ${current}) key=token.id\n${indent}    text token.text data-docs-token=token.kind\n`;
        },
      });
      let template = indices.get(source);
      if (template === undefined) {
        template = templates.length;
        indices.set(source, template);
        templates.push(source);
      }
      return { id, template, strings, tokens };
    });
    pages.set(doc.path, { path: doc.path, markdown: doc.markdown, blocks });
  }
  function renderTemplates(start: number, end: number, depth: number): string {
    const indent = "  ".repeat(depth);
    if (end - start === 1)
      return templates[start]!.split("\n")
        .filter(Boolean)
        .map((line) => indent + line)
        .join("\n");
    const middle = Math.floor((start + end) / 2);
    return `${indent}if block.template < ${middle}\n${renderTemplates(start, middle, depth + 1)}\n${indent}else\n${renderTemplates(middle, end, depth + 1)}`;
  }
  return {
    pages,
    contract: `shape DocsCodeToken
  id: number
  group: number
  text: string
  kind: string

shape DocsBlock
  id: number
  template: number
  strings: string[]
  tokens: DocsCodeToken[]

shape DocsContent
  path: string
  markdown: string
  blocks: DocsBlock[]

fn docsString(values: string[], index: number): string = match values.at(index) { case some(value) => value, case none => "" }

component DocsBody
  props
    body: DocsContent
  view
    article data-docs-part="article"
      for block in body.blocks key=block.id
${templates.length ? `        if block.template >= 0 and block.template < ${templates.length}\n${renderTemplates(0, templates.length, 5)}` : '        text ""'}
`,
  };
}
