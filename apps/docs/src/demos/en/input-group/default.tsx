"use client";

import { Envelope } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

// Adapted from HeroUI v3.2.6, Apache-2.0.
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});

export function Default() {
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
      </InputGroup>
    </TextField>
  );
}
