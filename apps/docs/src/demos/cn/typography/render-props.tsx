// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0); uses native Base UI render props.
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 576,
    flexDirection: "column",
    gap: 16,
  },
});
export function RenderProps() {
  return (
    <div {...stylex.props(styles.column)}>
      <Typography
        render={({ children, ...domProps }) => <h2 {...domProps}>{children}</h2>}
        type="h1"
      >
        H1 视觉样式，h2 语义元素
      </Typography>
      <Typography render={({ children, ...domProps }) => <span {...domProps}>{children}</span>}>
        The render prop can swap the underlying element while preserving Lenso UI props and styles.
      </Typography>
    </div>
  );
}
export default RenderProps;
