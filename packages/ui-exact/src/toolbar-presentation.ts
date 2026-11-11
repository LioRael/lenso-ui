import * as stylex from "@stylexjs/stylex";
import { toolbarStyles } from "@lenso/tokens/toolbar";
import { glassButtonStyles, glassButtonVariants } from "@lenso/tokens/glass-button";
import { buttonStyles } from "@lenso/tokens/button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import { linkStyles } from "@lenso/tokens/link";

const native = stylex.create({
  button: { backgroundImage: "none", "--exact-hover-wash": "none", "--exact-hover-dim": "1" },
  morphSm: { "--toolbar-group-button-height": "36px", "--toolbar-detachable-radius": "18px" },
  morphMd: { "--toolbar-group-button-height": "44px", "--toolbar-detachable-radius": "22px" },
  morphLg: { "--toolbar-group-button-height": "48px", "--toolbar-detachable-radius": "24px" },
  morphDirection: {
    "--lenso-exact-toolbar-initial-offset": {
      default: "0px",
      "@supports (width: calc(sibling-count() * 1px))":
        "calc((sibling-count() / 2 - sibling-index()) * 40px)",
    },
    transform: {
      default: null,
      ':is([data-lenso-kind="toolbar-fusion-group"][data-toolbar-direction="horizontal"][data-lenso-direction="ltr"][data-toolbar-detached="false"] > [data-toolbar-item])':
        "translateX(var(--toolbar-joined-offset, var(--lenso-exact-toolbar-joined-offset, var(--lenso-exact-toolbar-initial-offset))))",
      ':is([data-lenso-kind="toolbar-fusion-group"][data-toolbar-direction="horizontal"][data-lenso-direction="rtl"][data-toolbar-detached="false"] > [data-toolbar-item])':
        "translateX(calc(-1 * var(--toolbar-joined-offset, var(--lenso-exact-toolbar-joined-offset, var(--lenso-exact-toolbar-initial-offset)))))",
      ':is([data-lenso-kind="toolbar-fusion-group"][data-toolbar-direction="vertical"][data-toolbar-detached="false"] > [data-toolbar-item])':
        "translateY(var(--toolbar-joined-offset, var(--lenso-exact-toolbar-joined-offset, var(--lenso-exact-toolbar-initial-offset))))",
      ':is([data-lenso-kind="toolbar-fusion-group"][data-toolbar-detached="true"] > [data-toolbar-item])':
        "translate(0px, 0px)",
    },
  },
  tint: { "--lenso-control-tint": "var(--lenso-exact-toolbar-tint)" },
});
export const toolbarKinds = ["toolbar-highlight", "toolbar-link", "toolbar-button-icon"];
export function toolbarPresentation(kind: string, data: DOMStringMap) {
  if (kind === "toolbar-highlight") return [liquidMaterialStyles.pressHighlight];
  if (kind === "toolbar-link") return [linkStyles.root];
  if (kind === "toolbar-button-icon") return [buttonStyles.icon];
  if (
    ![
      "toolbar",
      "toolbar-group",
      "toolbar-fusion-group",
      "toolbar-button",
      "toolbar-separator",
    ].includes(kind)
  )
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
  if (kind === "toolbar-fusion-group")
    return [
      glassContainerStyles.root,
      toolbarStyles.group,
      orientation === "vertical" && toolbarStyles.groupVertical,
      toolbarStyles.detachableGroup,
      !surface && toolbarStyles.motion,
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
    data["lensoDetachable"] === "true" && [
      toolbarStyles.detachableButton,
      native.morphDirection,
      size === "sm" ? native.morphSm : size === "lg" ? native.morphLg : native.morphMd,
    ],
  ];
}
