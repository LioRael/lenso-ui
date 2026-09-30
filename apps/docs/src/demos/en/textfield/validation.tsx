"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, FieldError, Input, Label, TextArea, TextField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: "100%", maxWidth: 256, flexDirection: "column", gap: 16 },
});
export function Validation() {
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const isUsernameInvalid = username.length > 0 && username.length < 3;
  const isBioInvalid = bio.length > 0 && bio.length < 20;
  return (
    <div {...stylex.props(styles.root)}>
      <TextField invalid={isUsernameInvalid} name="username">
        <Label>Username</Label>
        <Input required value={username} onValueChange={setUsername} placeholder="jane_doe" />
        {isUsernameInvalid ? (
          <FieldError match>Username must be at least 3 characters.</FieldError>
        ) : (
          <Description style={{ display: "block" }}>
            Choose a unique username for your profile.
          </Description>
        )}
      </TextField>
      <TextField invalid={isBioInvalid} name="bio">
        <Label>Bio</Label>
        <TextArea
          required
          value={bio}
          onValueChange={setBio}
          placeholder="Tell us about yourself..."
        />
        {isBioInvalid ? (
          <FieldError match>Bio must contain at least 20 characters.</FieldError>
        ) : (
          <Description style={{ display: "block" }}>
            Minimum 20 characters ({bio.length}/20).
          </Description>
        )}
      </TextField>
    </div>
  );
}
