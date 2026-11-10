import type { DocumentNode } from "../content.ts";

/** The Exact backend owns Contract tags, props and escaping. */
export function renderContract(
  nodes: DocumentNode[],
  components: Record<string, string> = {},
): string {
  const quote = JSON.stringify;
  function emit(node: DocumentNode, depth: number): string {
    const indent = "  ".repeat(depth);
    if (node.kind === "text") return `${indent}text ${quote(node.value)}\n`;
    if (node.kind === "image") return `${indent}image ${quote(node.src)} alt=${quote(node.alt)}\n`;
    if (node.kind === "component") {
      const name = components[node.name];
      if (!name) throw new Error(`Unregistered component: ${node.name}`);
      return `${indent}${name}(${Object.entries(node.props)
        .map(([key, value]) => `${key}=${quote(value)}`)
        .join(", ")})\n${node.children.map((child) => emit(child, depth + 1)).join("")}`;
    }
    if (node.kind === "code") {
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
        ? ` id=${quote(node.id)}`
        : node.kind === "link"
          ? ` href=${quote(node.href)}`
          : node.kind === "list-item"
            ? ' role="listitem"'
            : node.kind === "separator"
              ? ' role="separator"'
              : node.kind === "th"
                ? ' scope="col"'
                : "";
    return `${indent}${tag} data-docs-part=${quote(node.kind)}${attrs}\n${"children" in node ? node.children.map((child) => emit(child, depth + 1)).join("") : ""}`;
  }
  return nodes.map((node) => emit(node, 0)).join("");
}
