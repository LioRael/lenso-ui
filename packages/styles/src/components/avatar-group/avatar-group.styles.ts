// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const avatarGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    "--avatar-group-overlap": "0.5rem",
    "--avatar-group-seam": "2px",
  },
  grid: { flexWrap: "wrap", gap: 12 },
  overlap: { marginInlineStart: "calc(-1 * var(--avatar-group-overlap, 0.5rem))" },
  ring: {
    position: "relative",
    boxShadow: `0 0 0 var(--avatar-group-seam, 2px) ${tokens.background}`,
  },
  clip: {
    maskImage: {
      default:
        "radial-gradient(circle at calc(100% + (var(--avatar-size, 2.5rem) / 2) - var(--avatar-group-overlap, 0.5rem)) 50%, transparent calc((var(--avatar-size, 2.5rem) / 2) + var(--avatar-group-seam, 2px)), #000 calc((var(--avatar-size, 2.5rem) / 2) + var(--avatar-group-seam, 2px)))",
      ":dir(rtl)":
        "radial-gradient(circle at calc(0% - (var(--avatar-size, 2.5rem) / 2) + var(--avatar-group-overlap, 0.5rem)) 50%, transparent calc((var(--avatar-size, 2.5rem) / 2) + var(--avatar-group-seam, 2px)), #000 calc((var(--avatar-size, 2.5rem) / 2) + var(--avatar-group-seam, 2px)))",
    },
  },
  count: { flexShrink: 0 },
});
