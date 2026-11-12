import * as stylex from "@stylexjs/stylex";
import { tagStyles as s } from "@lenso/tokens/tag";
import { tagGroupStyles as group } from "@lenso/tokens/tag-group";
import { materialStyles as m, liquidMaterialStyles as liquid } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  selected: {
    color: {
      ":hover": {
        default: "contrast-color(var(--lenso-control-tint-hover-fill))",
        "@supports not (color: contrast-color(red))": "var(--lenso-label-primary)",
      },
    },
    backgroundColor: {
      ":hover": {
        default: "var(--lenso-control-tint-hover-fill)",
        "@supports not (color: contrast-color(red))": "var(--lenso-control-tint-subtle-fill)",
      },
    },
  },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
export const tagKinds = [
  "tag-group",
  "tag-group-list",
  "tag-cell",
  "tag-lens",
  "tag-remove-button",
];
export function tagPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "tag-group") return [group.root];
  if (kind === "tag-group-list") return [group.list];
  if (kind === "tag-cell") return [s.cell];
  if (kind === "tag-remove-button") return [s.removeButton];
  if (kind === "tag-lens") return [m.layer, liquid.small, native.lens];
  if (kind !== "tag") return undefined;
  const size = data["lensoSize"],
    variant = data["lensoVariant"];
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Tag size: ${size}`);
  if (variant !== "default" && variant !== "surface")
    throw new RangeError(`Unknown Tag variant: ${variant}`);
  return [
    m.root,
    m.accessible,
    s.root,
    s[size],
    s[variant],
    data["lensoChecked"] === "true" && s.selected,
    data["lensoChecked"] === "true" && native.selected,
    data["lensoDisabled"] === "true" && s.disabled,
  ];
}
