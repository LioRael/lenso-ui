"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, ButtonGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function OutlineVariant() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>Button</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>ButtonGroup</p>
        <ButtonGroup variant="outline">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
