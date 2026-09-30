// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const typographyStyles = stylex.create({
  root: { color: tokens.foreground },
  truncate: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
export const typographyTypes = stylex.create({
  h1: { fontSize: 36, lineHeight: "40px", fontWeight: 600, letterSpacing: "-0.025em" },
  h2: { fontSize: 30, lineHeight: "36px", fontWeight: 600, letterSpacing: "-0.025em" },
  h3: { fontSize: 24, lineHeight: "32px", fontWeight: 600, letterSpacing: "-0.025em" },
  h4: { fontSize: 20, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.025em" },
  h5: { fontSize: 18, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.025em" },
  h6: { fontSize: 16, lineHeight: "24px", fontWeight: 600, letterSpacing: "-0.025em" },
  body: { fontSize: 16, lineHeight: "28px" },
  "body-sm": { fontSize: 14, lineHeight: "24px" },
  "body-xs": { fontSize: 12, lineHeight: "20px" },
  code: {
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.default,
    paddingInline: 6,
    paddingBlock: 2,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 14,
    lineHeight: "20px",
    color: tokens.foreground,
  },
});
export const typographyAligns = stylex.create({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
  justify: { textAlign: "justify" },
});
export const typographyColors = stylex.create({
  default: { color: tokens.foreground },
  muted: { color: tokens.muted },
});
export const typographyWeights = stylex.create({
  normal: { fontWeight: 400 },
  medium: { fontWeight: 500 },
  semibold: { fontWeight: 600 },
  bold: { fontWeight: 700 },
});
export const proseElements = stylex.create({
  link: {
    fontWeight: 500,
    color: tokens.link,
    textDecoration: "underline",
    textUnderlineOffset: 4,
  },
  blockquote: {
    marginTop: 16,
    borderInlineStartWidth: 4,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: tokens.border,
    paddingInlineStart: 16,
    color: tokens.muted,
    fontStyle: "italic",
  },
  ul: { marginBlock: 16, listStyleType: "disc", paddingInlineStart: 24 },
  ol: { marginBlock: 16, listStyleType: "decimal", paddingInlineStart: 24 },
  li: { fontSize: 16, lineHeight: "28px", marginTop: { default: 0, ":not(:first-child)": 8 } },
  hr: { marginBlock: 32, borderColor: tokens.separator },
  pre: {
    marginBlock: 16,
    overflowX: "auto",
    borderRadius: tokens.radiusXl,
    backgroundColor: tokens.default,
    padding: 16,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 14,
    lineHeight: 1.625,
  },
  strong: { fontWeight: 600, color: tokens.foreground },
  em: { fontStyle: "italic" },
  img: { marginBlock: 16, borderRadius: tokens.radiusXl },
});
