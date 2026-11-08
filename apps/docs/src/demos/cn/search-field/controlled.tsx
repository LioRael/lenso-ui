"use client";

import { GlassButton, Description, Label, SearchField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  input: {
    width: 280,
  },
});
export function Controlled() {
  const [value, setValue] = React.useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="search">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            xstyle={styles.input}
            placeholder="搜索…"
            value={value}
            onValueChange={setValue}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>当前值：{value || "（空）"}</Description>
      </SearchField>
      <div {...stylex.props(styles.actions)}>
        <GlassButton variant="default" onClick={() => setValue("")}>
          Clear
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue("example query")}>
          设置示例
        </GlassButton>
      </div>
    </div>
  );
}
