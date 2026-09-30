"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, TextArea, TextField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: "100%", maxWidth: 256, flexDirection: "column", gap: 16 },
});
export function Controlled() {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <TextField name="name">
        <Label>Display name</Label>
        <Input placeholder="Jane" value={name} onValueChange={setName} />
        <Description>Characters: {name.length}</Description>
      </TextField>
      <TextField name="bio">
        <Label>Bio</Label>
        <TextArea placeholder="Tell us about yourself..." value={bio} onValueChange={setBio} />
        <Description>Characters: {bio.length} / 200</Description>
      </TextField>
    </div>
  );
}
