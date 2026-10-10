/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and Base UI orientation selectors.
 */
import * as stylex from "@stylexjs/stylex";

export const radioGroupStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: {
      default: "column",
      ":is([data-orientation='horizontal'], [aria-orientation='horizontal'])": "row",
    },
    flexWrap: "wrap",
    gap: {
      default: 0,
      ":is([data-orientation='horizontal'], [aria-orientation='horizontal'])": "1rem",
    },
  },
});
