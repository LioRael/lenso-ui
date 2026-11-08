export interface HeadingTextNode {
  type: string;
  value?: string;
  alt?: string | null;
  children?: HeadingTextNode[];
}

export function headingText(node: HeadingTextNode): string {
  if (node.type === "image") return node.alt ?? "";
  return node.value ?? node.children?.map(headingText).join("") ?? "";
}

export function isNonRenderingPrefix(node: HeadingTextNode): boolean {
  if (node.type === "definition" || node.type === "mdxjsEsm") return true;
  if (node.type === "html") return /^<!--[\s\S]*-->$/u.test((node.value ?? "").trim());
  if (node.type === "mdxFlowExpression")
    return /^\/\*[\s\S]*\*\/$/u.test((node.value ?? "").trim());
  return false;
}
