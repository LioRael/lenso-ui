"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: 400, flexDirection: "column", gap: 16 },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextField fullWidth name="name">
        <Label>Your name</Label>
        <Input placeholder="John" />
      </TextField>
      <TextField fullWidth invalid name="password">
        <Label>Password</Label>
        <Input required type="password" />
        <FieldError match>Password must be longer than 8 characters</FieldError>
      </TextField>
    </div>
  );
}
