"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Envelope, Eye } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: { width: 400, display: "flex", flexDirection: "column", gap: 16 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField fullWidth name="email">
        <Label>Email address</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField fullWidth name="password">
        <Label>Password</Label>
        <InputGroup fullWidth>
          <InputGroup.Input placeholder="Enter password" type="password" />
          <InputGroup.Suffix>
            <Eye aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  );
}
