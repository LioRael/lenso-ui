"use client";
import { Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: 320, flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
});
export function Types() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.field)}>
        <Label htmlFor="input-type-email">Email</Label>
        <Input id="input-type-email" placeholder="jane@example.com" type="email" />
      </div>
      <div {...stylex.props(styles.field)}>
        <Label htmlFor="input-type-number">Age</Label>
        <Input id="input-type-number" min={0} placeholder="30" type="number" />
      </div>
      <div {...stylex.props(styles.field)}>
        <Label htmlFor="input-type-password">Password</Label>
        <Input id="input-type-password" placeholder="••••••••" type="password" />
      </div>
    </div>
  );
}
