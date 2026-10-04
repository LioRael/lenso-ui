// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 400,
    flexDirection: "column",
    gap: 16,
  },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextField fullWidth name="name">
        <Label>你的姓名</Label>
        <Input placeholder="John" />
      </TextField>
      <TextField fullWidth invalid name="password">
        <Label>密码</Label>
        <Input required type="password" />
        <FieldError match>密码长度必须超过 8 个字符</FieldError>
      </TextField>
    </div>
  );
}
