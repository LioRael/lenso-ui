"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { CloseButton } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Interactive() {
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(styles.interactive)}>
      <CloseButton
        aria-label={`Close (clicked ${count} times)`}
        onClick={() => setCount(count + 1)}
      />
      <span {...stylex.props(styles.count)}>Clicked: {count} times</span>
    </div>
  );
}
