"use client";

// Base UI owns render composition.
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    maxWidth: 448,
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  heading: {
    fontSize: 16,
    lineHeight: "24px",
    fontWeight: 500,
  },
  description: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--lenso-label-secondary)",
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
export function RenderFunction() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.intro)}>
        <h4 {...stylex.props(styles.heading)}>Lenso UI 组件</h4>
        <p {...stylex.props(styles.description)}>美观、快速、现代的 React UI 库。</p>
      </div>
      <Separator
        xstyle={styles.separator}
        render={(props) => <div {...props} data-custom="foo" />}
      />
      <div {...stylex.props(styles.links)}>
        <div>博客</div>
        <Separator
          orientation="vertical"
          render={(props) => <div {...props} data-custom="foo" />}
        />
        <div>文档</div>
        <Separator
          orientation="vertical"
          render={(props) => <div {...props} data-custom="foo" />}
        />
        <div>源码</div>
      </div>
    </div>
  );
}
export default RenderFunction;
