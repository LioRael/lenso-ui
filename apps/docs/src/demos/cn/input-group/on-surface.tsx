// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope } from "@gravity-ui/icons";
import { Description, InputGroup, Label, Surface, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  surface: {
    borderRadius: 16,
    padding: 24,
  },
  field: {
    width: "100%",
    maxWidth: 280,
  },
  icon: {
    width: 16,
    height: 16,
    color: "var(--muted)",
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TextField xstyle={styles.field} name="email">
        <Label>邮箱地址</Label>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
        </InputGroup>
        <Description>我们不会将此邮箱分享给任何人</Description>
      </TextField>
    </Surface>
  );
}
