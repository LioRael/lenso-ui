export type Heading = { title: string; id: string; level: number };
export type Token = { text: string; kind: string; scopes: string[] };
export type Primitive = string | number | boolean;
export type ContainerKind = "paragraph" | "strong" | "emphasis" | "strikethrough" | "codespan" | "blockquote" | "table" | "thead" | "tbody" | "tr" | "th" | "td";
export type DocumentNode =
  | { kind: "text"; value: string }
  | { kind: "heading"; level: number; id: string; children: DocumentNode[] }
  | { kind: "code"; value: string; language: string; tokens?: Token[] }
  | { kind: "link"; href: string; children: DocumentNode[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "list"; ordered: boolean; start: number; children: DocumentNode[] }
  | { kind: "list-item"; checked?: boolean; children: DocumentNode[] }
  | { kind: "separator" }
  | { kind: "component"; name: string; props: Record<string, Primitive>; children: DocumentNode[] }
  | { kind: ContainerKind; children: DocumentNode[] };

export function plainText(nodes: DocumentNode[]): string {
  return nodes.map(node => {
    if (node.kind === "text" || node.kind === "code") return node.value;
    if (node.kind === "image") return node.alt;
    return "children" in node ? plainText(node.children) : "";
  }).join("");
}
export function* walk(nodes: DocumentNode[]): Generator<DocumentNode> {
  for (const node of nodes) { yield node; if ("children" in node) yield* walk(node.children); }
}
