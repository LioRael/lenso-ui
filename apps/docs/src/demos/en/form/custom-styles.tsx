"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Button, Form, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  form: {
    display: "flex",
    width: 320,
    maxWidth: "100%",
    flexDirection: "column",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    padding: 16,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  input: { backgroundColor: "var(--field-background)" },
  button: { width: "100%" },
});

export function CustomStyles() {
  return (
    <Form xstyle={styles.form} onSubmit={(event) => event.preventDefault()}>
      <TextField name="email">
        <Label required>Work email</Label>
        <Input required type="email" xstyle={styles.input} placeholder="you@company.com" />
      </TextField>
      <Button xstyle={styles.button} type="submit">
        Continue
      </Button>
    </Form>
  );
}
