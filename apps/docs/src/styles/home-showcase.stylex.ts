// Copyright 2025 NextUI Inc. SPDX-License-Identifier: Apache-2.0.
// License: THIRD_PARTY_NOTICES.md.
import * as stylex from "@stylexjs/stylex";

export const homeShowcase = stylex.create({
  figure: { margin: 0, minWidth: 0, width: "100%" },
  scope: {
    position: "relative",
    isolation: "isolate",
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "var(--lenso-background-secondary)",
  },
  root: {
    position: "relative",
    gap: 0,
    minWidth: 0,
    height: "var(--home-scene-height)",
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
      "linear-gradient(180deg, rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.48) 28%, rgb(0 0 0 / 0.48) 62%, rgb(0 0 0 / 0.5))",
  },
  favorite: {
    display: { default: "none", "@media (min-width: 768px)": "inline-flex" },
    position: "absolute",
    insetInlineEnd: 24,
    bottom: "max(24px, env(safe-area-inset-bottom))",
  },
  productIntro: {
    position: "absolute",
    insetInline: { default: 24, "@media (min-width: 768px)": 64 },
    top: "48%",
    translate: "0 -50%",
    pointerEvents: "none",
  },
  photoCopy: {
    position: "absolute",
    display: { default: "none", "@media (min-width: 1024px)": "block" },
    insetInlineStart: 24,
    bottom: "max(40px, calc(env(safe-area-inset-bottom) + 16px))",
    color: "white",
  },
  photoTitle: {
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 260,
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: 500,
    textWrap: "pretty",
  },
  navigation: {
    position: "absolute",
    bottom: "max(24px, env(safe-area-inset-bottom))",
    insetInline: 0,
    marginInline: "auto",
    width: "min(320px, calc(100% - 32px))",
    display: "flex",
    justifyContent: "center",
  },
  tabList: { width: "min(100%, 320px)" },
  tab: { flex: 1, minHeight: 44, color: "white" },
});
