// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const dateRangePickerStyles = stylex.create({
  root: { display: "inline-flex", flexDirection: "column", gap: 4 },
  separator: { paddingInline: 4, color: tokens.labelPlaceholder, userSelect: "none" },
});
