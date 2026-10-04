// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope, Eye } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: {
    width: 400,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  icon: {
    width: 16,
    height: 16,
    color: "var(--muted)",
  },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField fullWidth name="email">
        <Label>邮箱地址</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField fullWidth name="password">
        <Label>密码</Label>
        <InputGroup fullWidth>
          <InputGroup.Input placeholder="输入密码" type="password" />
          <InputGroup.Suffix>
            <Eye aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  );
}
