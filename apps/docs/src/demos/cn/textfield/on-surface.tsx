// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, Surface, TextArea, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    minWidth: 340,
    flexDirection: "column",
    gap: 16,
    borderRadius: 24,
    padding: 24,
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <TextField name="name">
        <Label>你的姓名</Label>
        <Input fullWidth variant="secondary" placeholder="John" />
        <Description>我们绝不会与他人分享此信息</Description>
      </TextField>
      <TextField name="email">
        <Label>邮箱</Label>
        <Input type="email" fullWidth variant="secondary" placeholder="john@example.com" />
      </TextField>
      <TextField name="bio">
        <Label>个人简介</Label>
        <TextArea fullWidth variant="secondary" placeholder="介绍一下你自己…" rows={4} />
        <Description>至少 4 行</Description>
      </TextField>
    </Surface>
  );
}
