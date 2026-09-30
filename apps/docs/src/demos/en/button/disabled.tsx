"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ row: { display: "flex", flexWrap: "wrap", gap: 12 } });
export function Disabled() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button disabled>Primary</Button>
      <Button disabled variant="secondary">
        Secondary
      </Button>
      <Button disabled variant="tertiary">
        Tertiary
      </Button>
      <Button disabled variant="outline">
        Outline
      </Button>
      <Button disabled variant="ghost">
        Ghost
      </Button>
      <Button disabled variant="danger">
        Danger
      </Button>
    </div>
  );
}
