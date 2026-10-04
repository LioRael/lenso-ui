// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, TextArea, TextField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    maxWidth: 256,
    flexDirection: "column",
    gap: 16,
  },
});
export function Controlled() {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <TextField name="name">
        <Label>显示名称</Label>
        <Input placeholder="Jane" value={name} onValueChange={setName} />
        <Description>字符数：{name.length}</Description>
      </TextField>
      <TextField name="bio">
        <Label>个人简介</Label>
        <TextArea placeholder="介绍一下你自己…" value={bio} onValueChange={setBio} />
        <Description>字符数：{bio.length} / 200</Description>
      </TextField>
    </div>
  );
}
