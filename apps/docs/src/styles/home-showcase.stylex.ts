// Copyright 2025 NextUI Inc. SPDX-License-Identifier: Apache-2.0.
// License: THIRD_PARTY_NOTICES.md.
import * as stylex from "@stylexjs/stylex";

export const homeShowcase = stylex.create({
  figure: { margin: 0, minWidth: 0, width: "100%" },
  scope: {
    position: "relative",
    isolation: "isolate",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "var(--lenso-background-secondary)",
    boxShadow: "0 24px 64px -32px rgb(0 0 0 / 0.35)",
  },
  root: {
    position: "relative",
    gap: 0,
    minWidth: 0,
    height: { default: 440, "@media (min-width: 1024px)": 560 },
  },
  panel: {
    position: "absolute",
    inset: 0,
    marginTop: 0,
    marginInline: 0,
    marginBottom: 0,
    padding: 0,
    overflow: "hidden",
  },
  backdrop: { position: "absolute", inset: 0 },
  photo: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  shade: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage:
      "linear-gradient(180deg, rgb(0 0 0 / 0.72), rgb(0 0 0 / 0.6) 18%, transparent 42%, rgb(0 0 0 / 0.64) 58%, rgb(0 0 0 / 0.88))",
  },
  photoHeading: {
    position: "absolute",
    insetInline: 24,
    top: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  photoLabel: { fontSize: 14, fontWeight: 600, color: "white" },
  photoCopy: {
    position: "absolute",
    insetInline: { default: 24, "@media (min-width: 768px)": 32 },
    bottom: 100,
    color: "white",
  },
  photoTitle: {
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 360,
    fontSize: { default: 32, "@media (min-width: 768px)": 40 },
    lineHeight: 1.12,
    letterSpacing: "-0.035em",
    fontWeight: 600,
    textWrap: "balance",
  },
  navigation: {
    position: "absolute",
    bottom: 24,
    insetInline: 20,
    display: "flex",
    justifyContent: "center",
  },
  tabList: { width: "min(100%, 320px)" },
  tab: { flex: 1, minHeight: 44, color: "white" },
});
