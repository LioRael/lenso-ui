"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: "100%", maxWidth: 256, flexDirection: "column", gap: 16 },
});
export function InputTypes() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextField name="password">
        <Label>Password</Label>
        <Input type="password" placeholder="••••••••" />
      </TextField>
      <TextField name="age">
        <Label>Age</Label>
        <Input type="number" max="150" min="0" placeholder="21" />
      </TextField>
      <TextField name="email">
        <Label>Email</Label>
        <Input type="email" placeholder="user@example.com" />
      </TextField>
      <TextField name="website">
        <Label>Website</Label>
        <Input type="url" placeholder="https://example.com" />
      </TextField>
      <TextField name="phone">
        <Label>Phone</Label>
        <Input type="tel" placeholder="+1 (555) 000-0000" />
      </TextField>
    </div>
  );
}
