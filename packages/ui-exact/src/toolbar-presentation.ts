import * as stylex from "@stylexjs/stylex";
import { toolbarStyles } from "@lenso/tokens/toolbar";
import { glassButtonStyles, glassButtonVariants } from "@lenso/tokens/glass-button";
import { buttonStyles } from "@lenso/tokens/button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { linkStyles } from "@lenso/tokens/link";

const native = stylex.create({
  button: { backgroundImage: "none", "--exact-hover-wash": "none", "--exact-hover-dim": "1" },
  tint: { "--lenso-control-tint": "var(--lenso-exact-toolbar-tint)" },
});
export const toolbarKinds = ["toolbar-highlight", "toolbar-link", "toolbar-button-icon"];
export function toolbarPresentation(kind: string, data: DOMStringMap) {
  if (kind === "toolbar-highlight") return [liquidMaterialStyles.pressHighlight];
  if (kind === "toolbar-link") return [linkStyles.root];
  if (kind === "toolbar-button-icon") return [buttonStyles.icon];
  if (!["toolbar", "toolbar-group", "toolbar-button", "toolbar-separator"].includes(kind))
    return undefined;
  const orientation = data["orientation"];
  if (orientation !== "horizontal" && orientation !== "vertical")
    throw new RangeError(`Unknown Toolbar orientation: ${orientation}`);
  if (kind === "toolbar-separator")
    return [
      toolbarStyles.separator,
      orientation === "horizontal" ? toolbarStyles.horizontalLine : toolbarStyles.verticalLine,
    ];
  const surface = data["lensoSurface"] === "true";
  if (kind === "toolbar")
    return [
      toolbarStyles.root,
      orientation === "vertical" && toolbarStyles.vertical,
      data["lensoAttached"] === "true" && [
        liquidMaterialStyles.small,
        toolbarStyles.attached,
        toolbarStyles.motion,
      ],
    ];
  if (kind === "toolbar-group")
    return [
      toolbarStyles.group,
      orientation === "vertical" && toolbarStyles.groupVertical,
      surface && toolbarStyles.attachedGroup,
      !surface && toolbarStyles.motion,
      !surface && data["lensoGlass"] === "true" && liquidMaterialStyles.small,
    ];
  const variant = data["lensoVariant"];
  const size = data["lensoSize"];
  if (variant !== "glass" && variant !== "filled" && variant !== "plain")
    throw new RangeError(`Unknown Toolbar variant: ${variant}`);
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Toolbar size: ${size}`);
  const glass = data["lensoGlass"] === "true" && variant !== "plain";
  const icon = data["lensoIconOnly"] === "true";
  return [
    glassButtonStyles.root,
    toolbarStyles.button,
    native.button,
    glass && liquidMaterialStyles.small,
    variant !== "plain" && glassButtonVariants[variant === "filled" ? "prominent" : "default"],
    glassButtonStyles.interaction,
    surface && toolbarStyles.surfaceChild,
    !glass && toolbarStyles.plain,
    data["lensoDestructive"] === "true" && glassButtonStyles.destructive,
    data["lensoTinted"] === "true" && native.tint,
    orientation === "vertical" && toolbarStyles.verticalButton,
    icon && toolbarStyles.iconButton,
    size === "sm" && toolbarStyles.smallButton,
    size === "lg" && toolbarStyles.largeButton,
    icon && size === "sm" && toolbarStyles.smallIcon,
    icon && size === "lg" && toolbarStyles.largeIcon,
  ];
}
