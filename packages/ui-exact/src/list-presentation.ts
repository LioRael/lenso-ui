import * as stylex from "@stylexjs/stylex";
import { listStyles as s } from "@lenso/tokens/list";
import { groupStyles as g } from "@lenso/tokens/surface";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  hidden: { display: "none" },
  selection: {
    ":is(*) [data-lenso-kind=checkbox-control]": { borderRadius: 1000 },
    ":is(*) [data-lenso-kind=checkbox-content] > :last-child": { display: "none" },
  },
  editing: {
    ':is([data-lenso-active="true"]) [data-slot="list-action"]': {
      opacity: 1,
      cursor: "default",
      paddingInline: 0,
    },
  },
});
const parts = new Map<string, StyleInput>([
  ["list-reorder", [s.handle]],
  ["list-reorder-status", [s.srOnly]],
  ["list-reorder-owner", []],
  ["list-select-all", [native.hidden]],
  ["list-selection", [s.selection, native.selection]],
  ["list-body", [s.body]],
  ["list-content", [s.content]],
  ["list-title", [s.title]],
  ["list-description", [s.description]],
  ["list-leading", [s.leading]],
  ["list-trailing", [s.trailing]],
  ["list-action", [s.action]],
  ["list-section", [s.section]],
  ["list-section-heading", [s.sectionHeading]],
  ["list-separator", [g.separator, s.separator]],
]);
export const listKinds = [...parts.keys()];
export function listPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "list-root") {
    const variant = data["lensoVariant"];
    if (variant !== "grouped" && variant !== "plain")
      throw new RangeError(`Unknown List variant: ${variant}`);
    return [
      native.editing,
      variant === "grouped" && g.surface,
      s.root,
      variant === "grouped" && s.surface,
    ];
  }
  if (kind === "list-item") {
    const height = data["lensoHeight"];
    if (height !== "regular" && height !== "tall")
      throw new RangeError(`Unknown List height: ${height}`);
    return [g.row, s.item, s.boundary, height === "tall" && s.tall];
  }
  return parts.get(kind);
}
