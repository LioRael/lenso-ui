"use client";
import * as stylex from "@stylexjs/stylex";
import { Fieldset, TextField } from "@lenso/ui";

const styles = stylex.create({ section: { width: 402, maxWidth: "100%" } });

export function Basic() {
  return (
    <Fieldset aria-label="Contact details" xstyle={styles.section}>
      <Fieldset.Group>
        <TextField name="name">
          <TextField.Label>Name</TextField.Label>
          <TextField.Input placeholder="Alex" />
        </TextField>
        <TextField name="email">
          <TextField.Label>Email</TextField.Label>
          <TextField.Input type="email" placeholder="you@example.com" />
        </TextField>
        <TextField name="company">
          <TextField.Label>Company</TextField.Label>
          <TextField.Input defaultValue="Acme" />
        </TextField>
      </Fieldset.Group>
    </Fieldset>
  );
}
