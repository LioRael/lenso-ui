import type { DocumentNode } from "../content.ts";

export type ExactBindings = {
  string(value: string): string;
  code(node: Extract<DocumentNode, { kind: "code" }>, indent: string): string;
};

/** The Exact backend owns Contract tags, props and escaping. */
export function renderContract(
  nodes: DocumentNode[],
  components: Record<string, string> = {},
  bindings?: ExactBindings,
): string {
  const quote = JSON.stringify;
  const value = bindings?.string ?? quote;
  const paragraphText = (node: DocumentNode) =>
    node.kind === "paragraph" && node.children.length === 1 && node.children[0]?.kind === "text"
      ? node.children[0].value
      : undefined;
  function sequence(nodes: DocumentNode[], depth: number): string {
    if (bindings) return nodes.map((node) => emit(node, depth)).join("");
    let output = "";
    for (let i = 0; i < nodes.length;) {
      const values: string[] = [],
        seen = new Set<string>();
      for (let j = i; j < nodes.length; j++) {
        const value = paragraphText(nodes[j]!);
        if (value === undefined || seen.has(value)) break;
        values.push(value);
        seen.add(value);
      }
      // Exact expands component calls. One loop shares the paragraph instructions.
      // Duplicate text ends a run so value keys never merge distinct paragraphs.
      if (values.length > 1) {
        const indent = "  ".repeat(depth);
        output += `${indent}for docsParagraph in ${quote(values)} key=docsParagraph\n${indent}  text data-docs-part="paragraph"\n${indent}    text docsParagraph\n`;
        i += values.length;
      } else {
        output += emit(nodes[i++]!, depth);
      }
    }
    return output;
  }
  function emit(node: DocumentNode, depth: number): string {
    const indent = "  ".repeat(depth);
    if (node.kind === "text") return `${indent}text ${value(node.value)}\n`;
    if (node.kind === "image") return `${indent}image ${value(node.src)} alt=${value(node.alt)}\n`;
    if (node.kind === "component") {
      const name = components[node.name];
      if (!name) throw new Error(`Unregistered component: ${node.name}`);
      return `${indent}${name}(${Object.entries(node.props)
        .map(([key, value]) => `${key}=${quote(value)}`)
        .join(", ")})\n${sequence(node.children, depth + 1)}`;
    }
    if (node.kind === "code") {
      if (bindings) return bindings.code(node, indent);
      const tokens = node.tokens ?? [{ text: node.value, kind: "plain", scopes: [] }];
      return `${indent}text data-docs-part="code" data-docs-language=${quote(node.language)} white-space="pre-wrap"\n${tokens.map((token) => `${indent}  text ${quote(token.text)} data-docs-token=${quote(token.kind)}\n`).join("")}`;
    }
    const tag =
      node.kind === "heading"
        ? `h${node.level}`
        : node.kind === "link"
          ? "text"
          : node.kind === "separator" || node.kind === "list-item"
            ? "view"
            : node.kind === "blockquote"
              ? "section"
              : ["paragraph", "strong", "emphasis", "strikethrough", "codespan"].includes(node.kind)
                ? "text"
                : node.kind;
    const attrs =
      node.kind === "heading"
        ? ` id=${value(node.id)}`
        : node.kind === "link"
          ? ` href=${value(node.href)}`
          : node.kind === "list-item"
            ? ' role="listitem"'
            : node.kind === "separator"
              ? ' role="separator"'
              : node.kind === "th"
                ? ' scope="col"'
                : "";
    return `${indent}${tag} data-docs-part=${quote(node.kind)}${attrs}\n${"children" in node ? sequence(node.children, depth + 1) : ""}`;
  }
  return sequence(nodes, 0);
}
