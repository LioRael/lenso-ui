"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";

export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.column)}>
      <Label htmlFor={id}>Name</Label>
      <Input xstyle={demoStyles.field} id={id} placeholder="Enter your name" type="text" />
    </div>
  );
}
