// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 320,
    flexDirection: "column",
    gap: 16,
  },
  title: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: "var(--foreground)",
  },
  secondary: {
    backgroundColor: "var(--separator-secondary)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--muted)",
  },
  divider: {
    height: 16,
    backgroundColor: "var(--separator)",
  },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.column)}>
      <p {...stylex.props(styles.title)}>账户设置</p>
      <Separator xstyle={styles.secondary} />
      <div {...stylex.props(styles.links)}>
        <span>个人资料</span>
        <Separator xstyle={styles.divider} orientation="vertical" />
        <span>账单</span>
        <Separator xstyle={styles.divider} orientation="vertical" />
        <span>安全</span>
      </div>
    </div>
  );
}
export default CustomStyles;
