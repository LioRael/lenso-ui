"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Description, Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";

export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.column)}>
      <Label htmlFor={id}>Email</Label>
      <Input
        aria-describedby={`${id}-description`}
        xstyle={demoStyles.field}
        id={id}
        placeholder="you@example.com"
        type="email"
      />
      <Description id={`${id}-description`}>
        We'll never share your email with anyone else.
      </Description>
    </div>
  );
}
