"use client";

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
