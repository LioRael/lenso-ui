"use client";

import { Checkbox } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: ".75rem",
  },
  status: {
    fontSize: ".875rem",
    color: "var(--lenso-label-secondary)",
  },
  strong: {
    fontWeight: 500,
  },
});
export function Controlled() {
  const [isSelected, setIsSelected] = useState(true);
  return (
    <div {...stylex.props(styles.root)}>
      <Checkbox id="email-notifications" checked={isSelected} onCheckedChange={setIsSelected}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          邮件通知
        </Checkbox.Content>
      </Checkbox>
      <p {...stylex.props(styles.status)}>
        状态：<span {...stylex.props(styles.strong)}>{isSelected ? "已勾选" : "未勾选"}</span>
      </p>
    </div>
  );
}
