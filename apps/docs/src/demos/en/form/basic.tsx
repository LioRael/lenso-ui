"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Check } from "@gravity-ui/icons";
import { Button, Description, FieldError, Form, Input, Label, TextField } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", width: 384, maxWidth: "100%", gap: 16 },
  actions: { display: "flex", gap: 8 },
});

export function Basic() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    alert(`Form submitted with: ${JSON.stringify(data, null, 2)}`);
  }
  return (
    <Form xstyle={styles.form} onSubmit={onSubmit}>
      <TextField
        name="email"
        validate={(value) =>
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(String(value))
            ? null
            : "Please enter a valid email address"
        }
      >
        <Label required>Email</Label>
        <Input required type="email" placeholder="john@example.com" />
        <FieldError />
      </TextField>
      <TextField
        name="password"
        validate={(value) => {
          if (String(value).length < 8) return "Password must be at least 8 characters";
          if (!/[A-Z]/.test(String(value)))
            return "Password must contain at least one uppercase letter";
          if (!/[0-9]/.test(String(value))) return "Password must contain at least one number";
          return null;
        }}
      >
        <Label required>Password</Label>
        <Input required minLength={8} type="password" placeholder="Enter your password" />
        <Description>Must be at least 8 characters with 1 uppercase and 1 number</Description>
        <FieldError />
      </TextField>
      <div {...stylex.props(styles.actions)}>
        <Button type="submit">
          <Check aria-hidden="true" />
          Submit
        </Button>
        <Button type="reset" variant="secondary">
          Reset
        </Button>
      </div>
    </Form>
  );
}
