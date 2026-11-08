"use client";

import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 576,
    flexDirection: "column",
    gap: 12,
  },
});
export function Prose() {
  return (
    <Typography.Prose xstyle={styles.column}>
      <h1>正文标题</h1>
      <p>
        Prose is for authored content where the markup is already semantic and Lenso UI applies the
        default typography rhythm.
      </p>
      <h2>章节标题</h2>
      <p>
        行内代码如<code>render</code>与 Typography 原语获得相同的代码样式处理。
      </p>
    </Typography.Prose>
  );
}
export default Prose;
