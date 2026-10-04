// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    width: 280,
  },
  icon: {
    width: 16,
    height: 16,
    color: "var(--muted)",
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField xstyle={styles.field} name="primary">
        <Label>主要变体</Label>
        <InputGroup variant="primary">
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField xstyle={styles.field} name="secondary">
        <Label>次要变体</Label>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
    </div>
  );
}
