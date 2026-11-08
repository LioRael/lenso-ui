"use client";
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { height: 40, width: 40, flexShrink: 0, borderRadius: "50%" },
  text: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  name: { height: 12, width: 144, borderRadius: "var(--lenso-shape-content-lg)" },
  detail: { height: 12, width: 96, borderRadius: "var(--lenso-shape-content-lg)" },
});
export function UserProfile() {
  return (
    <div {...stylex.props(styles.row)}>
      <Skeleton xstyle={styles.avatar} />
      <div {...stylex.props(styles.text)}>
        <Skeleton xstyle={styles.name} />
        <Skeleton xstyle={styles.detail} />
      </div>
    </div>
  );
}
export default UserProfile;
