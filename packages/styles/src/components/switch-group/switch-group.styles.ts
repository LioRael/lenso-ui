/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and native grouping.
 */
import * as stylex from "@stylexjs/stylex";

export const switchGroupStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  items: { display: "flex", flexDirection: "column", gap: "1rem" },
  horizontal: { flexDirection: "row" },
  vertical: { flexDirection: "column" },
});
