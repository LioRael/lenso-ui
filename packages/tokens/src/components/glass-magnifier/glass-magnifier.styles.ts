// Magnifier adaptation, Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: demo presentation extracted into a dedicated StyleX component.
import * as stylex from "@stylexjs/stylex";

export const glassMagnifierStyles = stylex.create({
  root: {
    width: 210,
    height: 150,
    borderRadius: 75,
    "--lg-bezel": "25px",
    "--lg-thickness": "50px",
    "--lg-zoom": "1.13",
    "--lg-rim-saturation": "9",
    "--lg-blur": "0px",
  },
  draggable: {
    touchAction: "none",
    userSelect: "none",
    cursor: { default: "grab", ":is([data-glass-dragging])": "grabbing" },
  },
});
