/** HeroUI v3.2.6 story geometry. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";

export const dateTimeStoryStyles = stylex.create({
  column4: { display: "flex", flexDirection: "column", gap: 16 },
  column6: { display: "flex", flexDirection: "column", gap: 24 },
  column2: { display: "flex", flexDirection: "column", gap: 8 },
  column3: { display: "flex", flexDirection: "column", gap: 12 },
  column1: { display: "flex", flexDirection: "column", gap: 4 },
  row4: { display: "flex", gap: 16 },
  row2: { display: "flex", gap: 8 },
  center2: { display: "flex", alignItems: "center", gap: 8 },
  width256: { width: 256 },
  width280: { width: 280 },
  width320: { width: 320 },
  width400: { width: 400 },
  width110: { width: 110 },
  full: { width: "100%" },
  icon: { width: 16, height: 16, flexShrink: 0 },
  muted: { color: "var(--muted)" },
});
