"use client";
import { GlassButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 },
});
export function Basic() {
  return (
    <div {...stylex.props(s.row)}>
      <GlassButton>Done</GlassButton>
      <GlassButton variant="prominent">Done</GlassButton>
      <GlassButton destructive>Delete</GlassButton>
      <GlassButton variant="prominent" destructive>
        Delete
      </GlassButton>
    </div>
  );
}
