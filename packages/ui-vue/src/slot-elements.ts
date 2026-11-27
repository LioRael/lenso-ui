import { Comment, Fragment, Text, isVNode, type VNode } from "vue";

export function slotElements(children: unknown): VNode[] {
  if (Array.isArray(children)) return children.flatMap(slotElements);
  if (!isVNode(children) || children.type === Comment || children.type === Text) return [];
  return children.type === Fragment ? slotElements(children.children) : [children];
}
