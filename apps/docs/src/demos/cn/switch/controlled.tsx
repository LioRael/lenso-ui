"use client";

import { Switch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  status: {
    fontSize: ".875rem",
    color: "var(--lenso-label-secondary)",
  },
});
export function Controlled() {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div {...stylex.props(styles.root)}>
      <Switch checked={isSelected} onCheckedChange={setIsSelected}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          启用通知
        </Switch.Content>
      </Switch>
      <p {...stylex.props(styles.status)}>开关{isSelected ? "已打开" : "已关闭"}</p>
    </div>
  );
}
