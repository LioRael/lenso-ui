import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 12 },
  full: { width: 400, display: "flex", flexDirection: "column", gap: 12 },
  social: { width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 },
  stretch: { width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  muted: { fontSize: 14, color: "var(--muted)" },
  upgrade: {
    position: "relative",
    zIndex: 0,
    borderRadius: 9999,
    paddingInline: 40,
    paddingBlock: 12,
    fontWeight: 450,
    color: "light-dark(#262626,#f5f5f5)",
    backgroundImage: {
      default: "linear-gradient(to top,#f5f5f5,#fff)",
      ":hover": "linear-gradient(to top,#fff,#fafafa)",
      ':is([data-theme="dark"] *, .dark *)': "linear-gradient(to top,#171717,#262626,#262626cc)",
      ':is([data-theme="dark"] *, .dark *):hover':
        "linear-gradient(to top,#262626,#262626,#171717e6)",
    },
    filter: { default: "none", ":hover": "brightness(1.05)" },
    transform: { default: "none", ":active": "scale(.95)" },
    transitionProperty: "transform, filter, background-image",
    transitionDuration: { default: "300ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
    boxShadow:
      "rgba(0,0,0,.02) 0 1px 6px,rgba(0,0,0,.02) 0 3px 12px,rgba(0,0,0,.01) 0 8px 24px,rgba(0,0,0,.02) 0 18px 40px,rgba(0,0,0,.02) 0 40px 80px",
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      borderRadius: "inherit",
      padding: 1.5,
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(315deg,light-dark(#e5e5e5,#404040) 0%,light-dark(#fafafa,#262626) 50%,light-dark(#c4c4c4,#525252) 100%)",
      maskImage: "linear-gradient(#fff 0 0),linear-gradient(#fff 0 0)",
      maskClip: "content-box,border-box",
      maskComposite: "exclude",
    },
  },
  custom: {
    opacity: { default: 1, ":is([data-pending])": 0.4 },
    fontSize: 16,
    fontWeight: 600,
    boxShadow: "var(--shadow-md)",
    textShadow: "0 1px 2px #0004",
    borderRadius: 9999,
    height: 44,
    paddingInline: 24,
    color: "#fff",
    backgroundColor: {
      default: "light-dark(var(--accent),#ffffff1a)",
      ":hover": "light-dark(var(--accent-hover),#ffffff26)",
    },
  },
});
