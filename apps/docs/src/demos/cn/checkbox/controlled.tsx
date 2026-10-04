// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
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
    color: "var(--muted)",
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
