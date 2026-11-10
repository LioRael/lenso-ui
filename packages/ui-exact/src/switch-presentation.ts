import * as stylex from "@stylexjs/stylex";
import { switchStyles } from "@lenso/tokens/switch";
import { knobMaterialStyles } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    backgroundImage: "none",
    "--exact-hover-wash": "none",
    "--exact-hover-dim": "1",
    textAlign: "start",
    fontFamily: "inherit",
    position: "relative",
  },
  input: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});
const parts = new Map<string, StyleInput>([
  ["switch-content", [switchStyles.content]],
  ["switch-track", [switchStyles.track]],
  ["switch-icon", [switchStyles.icon]],
  ["switch-input", [native.input]],
  [
    "switch-knob-lens",
    [knobMaterialStyles.layer, knobMaterialStyles.toggle, knobMaterialStyles.controlEdge],
  ],
  ["switch-knob-face", [knobMaterialStyles.face]],
]);
export const switchKinds = [...parts.keys()];
export function switchPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind !== "switch" && kind !== "switch-control" && kind !== "switch-thumb")
    return parts.get(kind);
  const size = data["lensoSize"];
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Switch size: ${size}`);
  if (kind === "switch")
    return [
      switchStyles.root,
      native.root,
      size === "sm" && switchStyles.rootSm,
      size === "lg" && switchStyles.rootLg,
    ];
  if (kind === "switch-control")
    return [
      switchStyles.control,
      size === "sm" && switchStyles.controlSm,
      size === "lg" && switchStyles.controlLg,
    ];
  return [
    switchStyles.thumb,
    size === "sm" && switchStyles.thumbSm,
    size === "lg" && switchStyles.thumbLg,
  ];
}
