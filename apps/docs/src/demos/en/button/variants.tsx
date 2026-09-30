"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ row: { display: "flex", flexWrap: "wrap", gap: 12 } });
export function Variants() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </div>
  );
}
