"use client";

import { Input } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 320,
    flexDirection: "column",
    gap: 8,
  },
  value: {
    paddingInline: 4,
    fontSize: 14,
    color: "var(--lenso-label-secondary)",
  },
});
export function Controlled() {
  const [value, setValue] = React.useState("example.com");
  return (
    <div {...stylex.props(styles.root)}>
      <Input aria-label="域名" placeholder="域名" value={value} onValueChange={setValue} />
      <span {...stylex.props(styles.value)}>https://{value || "你的域名"}</span>
    </div>
  );
}
