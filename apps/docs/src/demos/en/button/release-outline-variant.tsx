"use client";
import { Button, ButtonGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function OutlineVariant() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>Button</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="borderless">Plain</Button>
        </div>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>ButtonGroup</p>
        <ButtonGroup variant="borderless">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
