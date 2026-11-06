"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface SkeletonStoryProps extends Pick<
  StoryComponentProps<typeof Skeleton>,
  "animationType"
> {}
export const initialArgs: SkeletonStoryProps = /* story-args:start */ {
  animationType: "shimmer",
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  panel: {
    width: 250,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderRadius: "var(--lenso-shape-content-lg)",
    backgroundColor: "transparent",
    padding: 16,
    boxShadow: "var(--lenso-surface-shadow)",
  },
  text: { display: "flex", flexDirection: "column", gap: 12 },
  picture: { height: 128, borderRadius: "var(--lenso-shape-content-lg)" },
  short: { height: 12, width: "60%", borderRadius: "var(--lenso-shape-content-lg)" },
  long: { height: 12, width: "80%", borderRadius: "var(--lenso-shape-content-lg)" },
  shortest: { height: 12, width: "40%", borderRadius: "var(--lenso-shape-content-lg)" },
});
export function Basic(overrides: SkeletonStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.panel)}>
      <Skeleton xstyle={styles.picture} {...args} />
      <div {...stylex.props(styles.text)}>
        <Skeleton xstyle={styles.short} />
        <Skeleton xstyle={styles.long} />
        <Skeleton xstyle={styles.shortest} />
      </div>
    </div>
  );
}
export default Basic;
