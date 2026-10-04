// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 256,
  },
});
export function WithDescription() {
  return (
    <TextField xstyle={styles.field} name="username">
      <Label>用户名</Label>
      <Input placeholder="输入用户名" />
      <Description>为你的账户选择一个唯一的用户名</Description>
    </TextField>
  );
}
