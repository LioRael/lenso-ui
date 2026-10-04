// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, ButtonGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function OutlineVariant() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>按钮</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="outline">线框</Button>
        </div>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>按钮组</p>
        <ButtonGroup variant="outline">
          <Button>第一项</Button>
          <Button>第二项</Button>
          <Button>第三项</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
