// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const styles = stylex.create({
  separator: {
    marginBlock: 16,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    height: 20,
  },
});
export function Basic() {
  return (
    <div>
      <h4>Lenso UI components</h4>
      <p {...stylex.props(demoStyles.muted)}>Source-backed React UI components.</p>
      <Separator xstyle={styles.separator} />
      <div {...stylex.props(styles.links)}>
        <span>博客</span>
        <Separator orientation="vertical" />
        <span>文档</span>
        <Separator orientation="vertical" />
        <span>源码</span>
      </div>
    </div>
  );
}
