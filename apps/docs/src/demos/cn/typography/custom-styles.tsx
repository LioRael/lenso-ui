// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  panel: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    gap: 8,
    borderRadius: "var(--radius-xl)",
    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface-secondary)",
    padding: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: ".025em",
    color: "var(--accent)",
    textTransform: "uppercase",
  },
  title: {
    fontWeight: 600,
    letterSpacing: "-.025em",
    color: "var(--foreground)",
  },
  text: {
    fontSize: 14,
    lineHeight: 1.625,
    color: "var(--muted)",
  },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.panel)}>
      <Typography xstyle={styles.category} type="body-xs">
        更新日志
      </Typography>
      <Typography xstyle={styles.title} type="h4">
        更快的搜索结果
      </Typography>
      <Typography xstyle={styles.text} type="body-sm">
        得益于改进的索引，查询现在在 200 毫秒内返回。
      </Typography>
    </div>
  );
}
export default CustomStyles;
