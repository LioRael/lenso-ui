// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 256,
  },
});
export function RenderFunction() {
  return (
    <TextField
      xstyle={styles.field}
      name="email"
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Label>邮箱</Label>
      <Input type="email" placeholder="输入你的邮箱" />
    </TextField>
  );
}
