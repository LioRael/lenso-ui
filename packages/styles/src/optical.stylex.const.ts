// Pointer coordinates must resolve on the control, not at the theme root.
// Optical adaptation, Copyright (c) 2026 Kelvin Zhang (MIT).
import * as stylex from "@stylexjs/stylex";
export const optical = stylex.defineConsts({
  pointerHighlight:
    "radial-gradient(circle 240px at var(--lg-x, 50%) var(--lg-y, 50%), rgb(255 255 255 / .035), rgb(255 255 255 / .025) 50%, transparent)",
});
