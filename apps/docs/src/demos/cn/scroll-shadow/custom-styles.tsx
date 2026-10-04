// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ScrollShadow } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const entries = [
  "与设计团队一起回顾季度目标。",
  "将深色模式设计令牌发布到生产环境。",
  "合并表单字段的无障碍修复。",
  "发布更新后的组件文档。",
  "安排下一冲刺的性能审计。",
  "在文档站点中添加滚动阴影示例。",
];
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: {
      default: null,
      "@media (min-width: 640px)": 384,
    },
  },
  scroll: {
    maxHeight: 192,
    borderRadius: "var(--radius-xl)",
    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundImage:
      "linear-gradient(to bottom, light-dark(oklch(98.5% 0 0 / .9), oklch(20.5% 0 0 / .8)), light-dark(white, oklch(20.5% 0 0)))",
    padding: 16,
    boxShadow: "0 0 0 1px light-dark(rgb(0 0 0 / .05), rgb(255 255 255 / .1))",
  },
  entries: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  entry: {
    fontSize: 14,
    lineHeight: 1.625,
    color: "light-dark(oklch(43.9% 0 0), oklch(70.8% 0 0))",
  },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.root)}>
      <ScrollShadow
        hideScrollBar
        tabIndex={0}
        aria-label="Recent activity"
        xstyle={styles.scroll}
        size={48}
        variant="fade"
      >
        <div {...stylex.props(styles.entries)}>
          {entries.map((entry) => (
            <p key={entry} {...stylex.props(styles.entry)}>
              {entry}
            </p>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}
export default CustomStyles;
