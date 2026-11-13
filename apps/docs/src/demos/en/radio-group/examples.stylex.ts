import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", minWidth: 0, width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 16 },
  description: { fontSize: 14, lineHeight: "20px", color: "var(--lenso-label-secondary)" },
  medium: { fontWeight: 500 },
  check: { fontSize: 12, lineHeight: 1, color: "var(--lenso-background-primary)" },
  horizontal: { flexDirection: "row", flexWrap: "wrap", gap: 24 },
  surface: { width: "100%", borderRadius: 24, padding: 24 },
  variants: { display: "flex", flexDirection: "column", gap: 32 },
  variant: { display: "flex", flexDirection: "column", gap: 8 },
  variantLabel: { fontSize: 14, fontWeight: 500, color: "var(--lenso-label-secondary)" },
  submit: { marginTop: 8, width: "fit-content" },
  billing: { width: "100%", maxWidth: 384, gap: 12 },
  billingRadio: { marginTop: 0 },
  billingLabel: {
    fontWeight: 500,
    color: {
      default: "var(--lenso-label-primary)",
      ":is([data-lenso-slot='radio'][data-checked] *)": "var(--lenso-status-success-text)",
    },
  },
  billingText: { display: "flex", flexDirection: "column", gap: 2 },
  billingDescription: {
    fontSize: 14,
    lineHeight: "20px",
    color: {
      default: "var(--lenso-label-secondary)",
      ":is([data-lenso-slot='radio'][data-checked] *)":
        "color-mix(in oklab, var(--lenso-status-success-text) 80%, transparent)",
    },
  },
  billingCard: {
    display: "flex",
    width: "100%",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--lenso-status-success-indicator) 10%, transparent)",
      ":is([data-lenso-slot='radio'][data-checked] *)":
        "color-mix(in oklab, var(--lenso-status-success-indicator) 30%, transparent)",
    },
    backgroundColor: {
      default:
        "color-mix(in oklab, var(--lenso-control-status-success-soft-fill) 30%, transparent)",
      ":hover": "var(--lenso-control-status-success-soft-hover-fill)",
      ":is([data-lenso-slot='radio'][data-checked] *)":
        "var(--lenso-control-status-success-soft-fill)",
      ":is([data-lenso-slot='radio'][data-checked]:hover *)":
        "var(--lenso-control-status-success-soft-hover-fill)",
    },
    paddingInline: 16,
    paddingBlock: 12,
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
    outline: {
      default: null,
      ":is([data-lenso-slot='radio']:focus-visible *)":
        "2px solid color-mix(in oklab, var(--lenso-status-success-indicator) 15%, transparent)",
    },
  },
  billingControl: {
    marginTop: 2,
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: "50%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "var(--lenso-control-border)",
      ":is([data-lenso-slot='radio'][data-checked] *)": "transparent",
    },
    backgroundColor: {
      default: "var(--lenso-control-fill)",
      ":is([data-lenso-slot='radio'][data-checked] *)": "var(--lenso-status-success-indicator)",
      ":is([data-lenso-slot='radio'][data-checked]:active *)":
        "var(--lenso-control-status-success-hover-fill)",
    },
    boxShadow: "none",
  },
  billingIndicator: { borderRadius: "50%" },
  billingDot: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "var(--lenso-control-fill)",
    scale: "1",
    transition: {
      default:
        "scale 200ms var(--lenso-motion-ease-out), background-color 200ms var(--lenso-motion-ease-out)",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  billingDotChecked: {
    backgroundColor: "var(--lenso-status-success-on-fill)",
    scale: {
      default: ".5",
      ":is([data-lenso-slot='radio']:active *)": ".57",
    },
  },
  checkout: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: 40,

    "--lenso-stroke-width": "2px",
    "--lenso-field-stroke-width": "2px",
  },
  section: { display: "flex", width: "100%", maxWidth: 512, flexDirection: "column", gap: 16 },
  deliveryGrid: {
    display: "grid",
    columnGap: 16,
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 768px)": "repeat(3, minmax(0, 1fr))",
    },
  },
  paymentGrid: {
    display: "grid",
    columnGap: 16,
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
    },
  },
  deliveryCard: {
    position: "relative",
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "transparent",
      ":is([data-lenso-slot='radio'][data-checked] *)": "var(--lenso-tint)",
      ":is([data-lenso-slot='radio']:focus-visible *)": "var(--lenso-tint)",
    },
    backgroundColor: {
      default: "var(--lenso-background-grouped-secondary)",
      ":is([data-lenso-slot='radio'][data-checked] *)":
        "color-mix(in oklab, var(--lenso-tint) 10%, transparent)",
      ":is([data-lenso-slot='radio']:focus-visible *)":
        "color-mix(in oklab, var(--lenso-tint) 10%, transparent)",
    },
    paddingInline: 20,
    paddingBlock: 16,
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
  },
  paymentCard: {
    position: "relative",
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "transparent",
      ":is([data-lenso-slot='radio'][data-checked] *)": "var(--lenso-tint)",
    },
    backgroundColor: {
      default: "var(--lenso-background-grouped-secondary)",
      ":is([data-lenso-slot='radio'][data-checked] *)":
        "color-mix(in oklab, var(--lenso-tint) 10%, transparent)",
    },
    paddingInline: 20,
    paddingBlock: 16,
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
  },
  checkoutControl: { position: "absolute", insetInlineEnd: 16, top: 12, width: 20, height: 20 },
  checkoutText: { display: "flex", flexDirection: "column", gap: 4 },
  price: { fontSize: 14, fontWeight: 600 },
  paymentHeading: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  icon: { width: 24, height: 24, flexShrink: 0 },
});
