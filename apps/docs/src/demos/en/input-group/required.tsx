"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope } from "@gravity-ui/icons";
import { Description, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  field: { width: "100%", maxWidth: 280 },
  price: { width: "100%", maxWidth: 200 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});
export function Required() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField xstyle={styles.field} name="email">
        <Label required>Email address</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input required xstyle={styles.field} placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField xstyle={styles.field} name="price">
        <Label required>Set a price</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input required xstyle={styles.price} placeholder="0" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
        <Description>What customers would pay</Description>
      </TextField>
    </div>
  );
}
