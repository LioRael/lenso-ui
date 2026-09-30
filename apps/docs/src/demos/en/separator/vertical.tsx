"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  links: { display: "flex", alignItems: "center", gap: 16, height: 20, fontSize: 14 },
});
export function Vertical() {
  return (
    <div {...stylex.props(styles.links)}>
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  );
}
export default Vertical;
