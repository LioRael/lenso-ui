export function headingText(node) {
  if (node.type === "image") return node.alt ?? "";
  return node.value ?? node.children?.map(headingText).join("") ?? "";
}

export function isNonRenderingPrefix(node) {
  if (node.type === "definition" || node.type === "mdxjsEsm") return true;
  if (node.type === "html") return /^<!--[\s\S]*-->$/u.test((node.value ?? "").trim());
  if (node.type === "mdxFlowExpression")
    return /^\/\*[\s\S]*\*\/$/u.test((node.value ?? "").trim());
  return false;
}
