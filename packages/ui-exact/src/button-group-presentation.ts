import * as stylex from "@stylexjs/stylex";
import { buttonGroupStyles, buttonGroupItemStyles } from "@lenso/tokens/button-group";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";

const native = stylex.create({
  action: { cursor: { default: "pointer", ':is([data-lenso-loading="true"])': "progress" } },
  tint: { "--lenso-control-tint": "var(--lenso-exact-action-tint)" },
});
export const buttonGroupKinds = [
  "button-group-icon",
  "glass-button-group-icon",
  "button-group-press-highlight",
];
function orientationOf(data: DOMStringMap) {
  if (data["orientation"] === "horizontal" || data["orientation"] === "vertical")
    return data["orientation"];
  throw new RangeError(`Unknown Lenso ButtonGroup orientation: ${data["orientation"]}`);
}
export function buttonGroupPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "button-group-icon") return [buttonStyles.icon];
  if (kind === "glass-button-group-icon") return [glassButtonStyles.icon];
  if (kind === "button-group-press-highlight") return [liquidMaterialStyles.pressHighlight];
  if (
    ![
      "button-group",
      "button-group-separator",
      "button-group-item",
      "glass-button-group-item",
    ].includes(kind)
  )
    return;
  const orientation = orientationOf(data);
  const full = data["lensoFullWidth"] === "true",
    detached = data["lensoDetached"] === "true";
  if (kind === "button-group")
    return [
      buttonGroupStyles.root,
      buttonGroupStyles[orientation],
      full && buttonGroupStyles.fullWidth,
      detached && buttonGroupStyles.detached,
    ];
  if (kind === "button-group-separator")
    return [
      buttonGroupStyles.separator,
      orientation === "horizontal"
        ? buttonGroupStyles.separatorHorizontal
        : buttonGroupStyles.separatorVertical,
    ];
  const size = data["lensoSize"];
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Lenso ButtonGroup size: ${size}`);
  const destructive = data["lensoDestructive"] === "true",
    tinted = data["lensoTinted"] === "true";
  const glass = kind === "glass-button-group-item",
    icon = data["lensoIconOnly"] === "true";
  if (!["default", "prominent", "bordered", "borderless"].includes(data["lensoVariant"] ?? ""))
    throw new RangeError(`Unknown Lenso ButtonGroup variant: ${data["lensoVariant"]}`);
  const variant = glass
    ? data["lensoVariant"] === "prominent"
      ? "prominent"
      : "default"
    : data["lensoVariant"] === "default"
      ? "bordered"
      : data["lensoVariant"];
  if (
    variant !== "prominent" &&
    variant !== "default" &&
    variant !== "bordered" &&
    variant !== "borderless"
  )
    throw new RangeError(`Unknown Lenso ButtonGroup variant: ${variant}`);
  return [
    ...(glass
      ? [
          glassButtonStyles.root,
          liquidMaterialStyles.small,
          glassButtonStyles.backdrop,
          glassButtonSizes[size],
          glassButtonVariants[variant as "default" | "prominent"],
          glassButtonStyles.interaction,
          icon && glassButtonStyles.iconOnly,
          icon && glassButtonIconOnlySizes[size],
          full && glassButtonStyles.fullWidth,
        ]
      : [
          buttonStyles.root,
          buttonSizes[size],
          buttonVariants[variant as "prominent" | "bordered" | "borderless"],
          buttonStyles.tracking,
          destructive && buttonStyles.destructiveTracking,
          destructive && size === "lg" && buttonStyles.destructiveLargeTracking,
          variant === "bordered" && (destructive || tinted) && buttonStyles.tintedBordered,
          variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
          icon && buttonStyles.iconOnly,
          icon && buttonIconOnlySizes[size],
          full && buttonStyles.fullWidth,
        ]),
    native.action,
    destructive && buttonStyles.destructive,
    tinted && native.tint,
    !detached && buttonGroupItemStyles[orientation],
    full && buttonGroupItemStyles.stretch,
  ];
}
