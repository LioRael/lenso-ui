"use client";

import { Description, TextArea } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 384,
    flexDirection: "column",
    gap: 8,
  },
});
export function Controlled() {
  const [value, setValue] = React.useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <TextArea
        aria-describedby="textarea-controlled-description"
        aria-label="公告"
        placeholder="撰写公告…"
        value={value}
        onValueChange={setValue}
      />
      <Description id="textarea-controlled-description">字符数：{value.length} / 280</Description>
    </div>
  );
}
