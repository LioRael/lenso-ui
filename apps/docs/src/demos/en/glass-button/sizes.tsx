"use client";
import { GlassButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 },
});
export function Sizes() {
  return (
    <div {...stylex.props(s.row)}>
      <GlassButton size="sm">Small</GlassButton>
      <GlassButton size="md">Medium</GlassButton>
      <GlassButton size="lg">Large</GlassButton>
    </div>
  );
}
