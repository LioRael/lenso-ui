// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, FieldError, Input, Label, TextArea, TextField } from "@lenso/ui";
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
export function Validation() {
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const isUsernameInvalid = username.length > 0 && username.length < 3;
  const isBioInvalid = bio.length > 0 && bio.length < 20;
  return (
    <div {...stylex.props(styles.root)}>
      <TextField invalid={isUsernameInvalid} name="username">
        <Label>用户名</Label>
        <Input required value={username} onValueChange={setUsername} placeholder="jane_doe" />
        {isUsernameInvalid ? (
          <FieldError match>用户名至少需要 3 个字符。</FieldError>
        ) : (
          <Description
            style={{
              display: "block",
            }}
          >
            为你的资料选择一个唯一的用户名。
          </Description>
        )}
      </TextField>
      <TextField invalid={isBioInvalid} name="bio">
        <Label>个人简介</Label>
        <TextArea required value={bio} onValueChange={setBio} placeholder="介绍一下你自己…" />
        {isBioInvalid ? (
          <FieldError match>个人简介至少需要 20 个字符。</FieldError>
        ) : (
          <Description
            style={{
              display: "block",
            }}
          >
            至少 20 个字符 ({bio.length}/20).
          </Description>
        )}
      </TextField>
    </div>
  );
}
