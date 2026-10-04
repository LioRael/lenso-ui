// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { CloseButton } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/close-button/source.stylex";
export function Interactive() {
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(styles.interactive)}>
      <CloseButton aria-label={`关闭（已点击 ${count} 次）`} onClick={() => setCount(count + 1)} />
      <span {...stylex.props(styles.count)}>已点击：{count}次</span>
    </div>
  );
}
