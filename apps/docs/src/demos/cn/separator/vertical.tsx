// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  links: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    height: 20,
    fontSize: 14,
  },
});
export function Vertical() {
  return (
    <div {...stylex.props(styles.links)}>
      <div>博客</div>
      <Separator orientation="vertical" />
      <div>文档</div>
      <Separator orientation="vertical" />
      <div>源码</div>
    </div>
  );
}
export default Vertical;
