import {
  plainText,
  type ContainerKind,
  type DocumentNode,
  type Heading,
  type Primitive,
} from "./content.ts";
const decode = (children: string): DocumentNode[] => JSON.parse(`[${children.replace(/,$/, "")}]`);
const encode = (node: DocumentNode) => `${JSON.stringify(node)},`;

/** Parses portable content data; renderer syntax never enters the model. */
export function parseMarkdown(source: string, resolveLink: (href: string) => string) {
  const headings: Heading[] = [],
    links: string[] = [];
  const ids = new Set(["docs-content"]);
  const container = (kind: ContainerKind, children: string) =>
    encode({ kind, children: decode(children) });
  const callbacks: Bun.markdown.RenderCallbacks = {
    text: (value) => encode({ kind: "text", value }),
    heading: (children, { level }) => {
      const title = plainText(decode(children));
      const base =
        title
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .trim()
          .replace(/\s+/g, "-") || "section";
      let id = base;
      for (let suffix = 2; ids.has(id); suffix++) id = `${base}-${suffix}`;
      ids.add(id);
      headings.push({ title, id, level });
      return encode({ kind: "heading", level, id, children: decode(children) });
    },
    paragraph: (c) => container("paragraph", c),
    strong: (c) => container("strong", c),
    emphasis: (c) => container("emphasis", c),
    strikethrough: (c) => container("strikethrough", c),
    codespan: (c) => container("codespan", c),
    blockquote: (c) => container("blockquote", c),
    table: (c) => container("table", c),
    thead: (c) => container("thead", c),
    tbody: (c) => container("tbody", c),
    tr: (c) => container("tr", c),
    th: (c) => container("th", c),
    td: (c) => container("td", c),
    code: (children, meta) => {
      const value = plainText(decode(children)),
        language = meta?.language?.trim().split(/\s+/)[0] ?? "";
      if (language !== "exact-component") return encode({ kind: "code", value, language });
      const call: unknown = JSON.parse(value);
      if (
        !mapping(call) ||
        typeof call["name"] !== "string" ||
        !/^[A-Z][A-Za-z0-9]*$/.test(call["name"])
      )
        throw new Error("exact-component requires a registered component name");
      const props = call["props"] ?? {};
      if (!mapping(props)) throw new Error("Component props must be a JSON object");
      const values: Record<string, Primitive> = {};
      for (const [key, value] of Object.entries(props)) {
        if (
          !/^[A-Za-z][A-Za-z0-9]*$/.test(key) ||
          !["string", "number", "boolean"].includes(typeof value) ||
          (typeof value === "number" && !Number.isFinite(value))
        )
          throw new Error(`Unsupported component prop: ${key}`);
        if (typeof value === "string" || typeof value === "boolean" || typeof value === "number")
          values[key] = value;
      }
      const childrenSource = call["children"];
      if (childrenSource !== undefined && typeof childrenSource !== "string")
        throw new Error("Component children must be Markdown text");
      return encode({
        kind: "component",
        name: call["name"],
        props: values,
        children: typeof childrenSource === "string" ? parse(childrenSource) : [],
      });
    },
    list: (children, meta) =>
      encode({
        kind: "list",
        ordered: meta.ordered,
        start: meta.start ?? 1,
        children: decode(children),
      }),
    listItem: (children, meta) =>
      encode({
        kind: "list-item",
        ...(meta.checked === undefined ? {} : { checked: meta.checked }),
        children: decode(children),
      }),
    hr: () => encode({ kind: "separator" }),
    link: (children, { href }) => {
      const resolved = resolveLink(href);
      if (/^\s*(javascript|data|vbscript):/i.test(resolved))
        throw new Error(`Unsupported link: ${href}`);
      links.push(resolved);
      return encode({ kind: "link", href: resolved, children: decode(children) });
    },
    image: (children, { src }) => {
      if (!/^(https?:\/\/|\/assets\/|assets\/)/.test(src))
        throw new Error(`Images must use assets/ or HTTPS URLs: ${src}`);
      return encode({ kind: "image", src, alt: plainText(decode(children)) });
    },
    html: () => {
      throw new Error(
        "Raw HTML and MDX are unsupported; use a registered component or .contract page",
      );
    },
  };
  function parse(input: string) {
    return decode(Bun.markdown.render(input, callbacks, { tables: true }));
  }
  const nodes = parse(source);
  return { nodes, headings, links, text: nodes.map((node) => plainText([node])).join("\n") };
}
function mapping(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
