"use client";
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  list: { width: "100%", maxWidth: 384, display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { height: 40, width: 40, flexShrink: 0, borderRadius: "var(--lenso-shape-content-lg)" },
  text: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  full: { height: 12, width: "100%", borderRadius: "var(--lenso-shape-content)" },
  short: { height: 12, width: "80%", borderRadius: "var(--lenso-shape-content)" },
});
export function List() {
  return (
    <div {...stylex.props(styles.list)}>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} {...stylex.props(styles.row)}>
          <Skeleton xstyle={styles.avatar} />
          <div {...stylex.props(styles.text)}>
            <Skeleton xstyle={styles.full} />
            <Skeleton xstyle={styles.short} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default List;
