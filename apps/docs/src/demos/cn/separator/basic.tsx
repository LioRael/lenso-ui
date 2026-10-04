// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    maxWidth: 448,
  },
  heading: {
    fontSize: 16,
    lineHeight: "24px",
    fontWeight: 500,
  },
  description: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--muted)",
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  separator: {
    marginBlock: 16,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    height: 20,
    fontSize: 14,
  },
});
export function Basic() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.intro)}>
        <h4 {...stylex.props(styles.heading)}>HeroUI v3 组件</h4>
        <p {...stylex.props(styles.description)}>美观、快速、现代的 React UI 库。</p>
      </div>
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
