const appearance = new Set([
  "variant",
  "size",
  "color",
  "initialColor",
  "tint",
  "fullWidth",
  "orientation",
  "radius",
  "glass",
  "layout",
  "placement",
  "position",
  "align",
  "side",
  "shape",
]);
const content = new Set([
  "label",
  "title",
  "description",
  "placeholder",
  "value",
  "defaultValue",
  "children",
  "min",
  "max",
  "step",
  "name",
  "type",
  "text",
  "count",
  "maxLength",
]);
const state = new Set([
  "disabled",
  "invalid",
  "required",
  "readOnly",
  "isLoading",
  "loading",
  "checked",
  "defaultChecked",
  "selected",
  "open",
  "defaultOpen",
  "clearable",
  "destructive",
  "indeterminate",
  "multiple",
]);

export function groupParameters<T extends { name: string }>(properties: readonly T[]) {
  const groups: Record<"content" | "appearance" | "state" | "more", T[]> = {
    content: [],
    appearance: [],
    state: [],
    more: [],
  };
  for (const property of properties) {
    const key = appearance.has(property.name)
      ? "appearance"
      : content.has(property.name)
        ? "content"
        : state.has(property.name)
          ? "state"
          : "more";
    groups[key].push(property);
  }
  return groups;
}
