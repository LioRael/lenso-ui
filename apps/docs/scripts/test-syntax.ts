import { parse } from "@babel/parser";
import { VISITOR_KEYS, type Node } from "@babel/types";

export function parseTestSource(code: string) {
  return parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
}

export function walkSyntax(node: Node, visit: (node: Node) => void): void {
  visit(node);
  for (const key of VISITOR_KEYS[node.type] ?? []) {
    const value = (node as unknown as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      for (const item of value)
        if (item && typeof item === "object" && "type" in item) walkSyntax(item as Node, visit);
    } else if (value && typeof value === "object" && "type" in value) {
      walkSyntax(value as Node, visit);
    }
  }
}
