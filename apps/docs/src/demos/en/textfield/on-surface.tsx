"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, Surface, TextArea, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    minWidth: 340,
    flexDirection: "column",
    gap: 16,
    borderRadius: 24,
    padding: 24,
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <TextField name="name">
        <Label>Your name</Label>
        <Input fullWidth variant="secondary" placeholder="John" />
        <Description>We'll never share this with anyone else</Description>
      </TextField>
      <TextField name="email">
        <Label>Email</Label>
        <Input type="email" fullWidth variant="secondary" placeholder="john@example.com" />
      </TextField>
      <TextField name="bio">
        <Label>Bio</Label>
        <TextArea fullWidth variant="secondary" placeholder="Tell us about yourself..." rows={4} />
        <Description>Minimum 4 rows</Description>
      </TextField>
    </Surface>
  );
}
