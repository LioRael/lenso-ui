"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  field: { width: "100%", maxWidth: 280 },
  price: { width: "100%", maxWidth: 200 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});
export function Disabled() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField disabled xstyle={styles.field} name="email">
        <Label>Email address</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input xstyle={styles.field} defaultValue="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField disabled xstyle={styles.field} name="price">
        <Label>Set a price</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input xstyle={styles.price} defaultValue="10" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  );
}
