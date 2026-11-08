"use client";

// uses native Base UI render props.
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
