"use client";

import { Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.column)}>
      <Label htmlFor={id}>姓名</Label>
      <Input xstyle={demoStyles.field} id={id} placeholder="输入你的姓名" type="text" />
    </div>
  );
}
