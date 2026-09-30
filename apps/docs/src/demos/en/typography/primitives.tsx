"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", maxWidth: 576, flexDirection: "column", gap: 16 },
});
export function Primitives() {
  return (
    <div {...stylex.props(styles.column)}>
      <Typography.Heading level={1}>Dashboard</Typography.Heading>
      <Typography.Paragraph>
        Convenience primitives are thin wrappers over Typography, so you can choose explicit
        composition without learning a second styling system.
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Paragraph supports base, sm, and xs sizes.
      </Typography.Paragraph>
      <Typography.Code>Typography.Code</Typography.Code>
    </div>
  );
}
export default Primitives;
