// Apple kit dimensions; Web refraction uses the separately licensed glass optical renderer.
import * as stylex from "@stylexjs/stylex";
export const glassButtonStyles = stylex.create({
  root: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "fit-content",
    border: 0,
    borderRadius: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
    letterSpacing: 0,
    textDecoration: "none",
    whiteSpace: "nowrap",
    userSelect: "none",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    cursor: { default: "pointer", ":disabled": "default" },
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: 3,
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
    "@media (forced-colors: active)": {
      backdropFilter: "none",
      backgroundImage: "none",
      outline: "1px solid ButtonText",
    },
  },
  interaction: {
    boxShadow: {
      default:
        "inset 0 0 0 100vmax transparent, var(--lenso-fusion-shadow, var(--lenso-interaction-elevation, var(--lenso-glass-shadow, var(--lenso-material-action-shadow))))",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ':hover:not(:focus):not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
          "inset 0 0 0 100vmax var(--lenso-glass-interaction-fill, var(--lenso-fill-secondary)), var(--lenso-fusion-shadow, var(--lenso-interaction-elevation, var(--lenso-glass-shadow, var(--lenso-material-action-shadow))))",
      },
      ':focus:not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
        "inset 0 0 0 100vmax var(--lenso-glass-interaction-fill, var(--lenso-fill-primary)), var(--lenso-fusion-shadow, var(--lenso-interaction-elevation, var(--lenso-glass-shadow, var(--lenso-material-action-shadow))))",
    },
    transitionProperty: "box-shadow",
    transitionDuration: { default: "120ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  backdrop: {
    backdropFilter: {
      default:
        "blur(var(--lg-blur)) var(--lenso-fusion-filter, var(--lenso-glass-button-filter, var(--lg-filter, saturate(1)))) opacity(calc(var(--lenso-glass-face-opacity, 1) * var(--lenso-fusion-opacity, 1)))",
      ":is([data-copy], [data-material-paints], [data-lenso-glass-fused])": "none",
      ':is(:disabled, [aria-disabled="true"])': "none",
      ":is([data-lenso-glass-opaque])": "none",
      "@media (forced-colors: active)": "none",
    },
    "::before": {
      opacity: {
        default: 1,
        ":is([data-material-filter])": "var(--lenso-glass-button-fallback-paint, 0)",
        ':is([data-copy][data-material-filter], [data-material-paints], :disabled, [aria-disabled="true"])': 0,
      },
    },
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "var(--apple-glass-icon-width, 19px)",
    height: "var(--apple-glass-icon-height, 22px)",
    flexShrink: 0,
    pointerEvents: "none",
  },
  iconOnly: {
    width: "auto",
    aspectRatio: "1",
    paddingInline: 0,
    paddingBlock: 0,
    "--apple-glass-icon-width": "28px",
    "--apple-glass-icon-height": "36px",
  },
  destructive: {
    "--lenso-control-tint": "var(--lenso-action-destructive)",
    "--lenso-control-on-tint": "var(--lenso-label-on-destructive)",
    "--lenso-control-tint-text": "var(--lenso-action-destructive-text)",
  },
  tint: (color: string) => ({ "--lenso-control-tint": color }),
  fullWidth: { width: "100%" },
  pending: { cursor: "progress" },
});
export const glassButtonIconOnlySizes = stylex.create({
  sm: { width: 28, "--apple-glass-icon-width": "17px", "--apple-glass-icon-height": "20px" },
  md: { width: 34, "--apple-glass-icon-width": "20px", "--apple-glass-icon-height": "24px" },
  lg: { width: 50 },
});
export const glassButtonSizes = stylex.create({
  sm: { height: 28, paddingInline: 10, paddingBlock: 5, fontSize: 15, lineHeight: "18px", gap: 4 },
  md: { height: 34, paddingInline: 12, paddingBlock: 8, fontSize: 17, lineHeight: "18px", gap: 4 },
  lg: { height: 50, paddingInline: 20, paddingBlock: 16, fontSize: 17, lineHeight: "18px", gap: 4 },
});
export const glassButtonVariants = stylex.create({
  default: {
    backgroundColor: {
      default: "transparent",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-material-action-disabled-fill)",
    },
    color: {
      default:
        "var(--lg-light-label, var(--lenso-control-tint, var(--lenso-material-action-label)))",
      ':is(:active, [data-lenso-pressed], [data-lenso-key-pressed]):not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
        "var(--lg-light-label, rgb(26 26 26))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-material-action-disabled-label)",
    },
  },
  prominent: {
    "--lenso-glass-press-fill":
      "color-mix(in srgb, var(--lenso-control-tint, var(--lenso-tint)) 80%, black)",
    "--lenso-glass-material-fill": "var(--lenso-control-tint, var(--lenso-tint))",
    "--lenso-glass-material-blend": "multiply",
    "--lenso-interaction-elevation":
      "var(--lenso-glass-shadow, var(--lenso-material-action-prominent-shadow))",
    backgroundColor: {
      default: "rgb(255 255 255 / .94)",
      ":is([data-material-filter])": "var(--lenso-glass-button-fallback-background, transparent)",
      ":is([data-copy][data-material-filter])": "transparent",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-material-action-disabled-fill)",
    },
    color: {
      default: "var(--lenso-control-on-tint, var(--lenso-label-on-tint))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-material-action-disabled-label)",
    },
  },
});
