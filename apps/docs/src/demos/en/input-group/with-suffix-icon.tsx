"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope } from "@gravity-ui/icons";
import { Description, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});
export function WithSuffixIcon() {
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
        <InputGroup.Suffix>
          <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Suffix>
      </InputGroup>
      <Description>We don't send spam</Description>
    </TextField>
  );
}
