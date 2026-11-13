"use client";
import { Checkbox } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: ".75rem" },
  status: { fontSize: ".875rem", color: "var(--lenso-label-secondary)" },
  strong: { fontWeight: 500 },
});
export function Controlled() {
  const [isSelected, setIsSelected] = useState(true);
  return (
    <div {...stylex.props(styles.root)}>
      <Checkbox
        id="email-notifications"
        checked={isSelected}
        onCheckedChange={(checked) => setIsSelected(checked === true)}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          Email notifications
        </Checkbox.Content>
      </Checkbox>
      <p {...stylex.props(styles.status)}>
        Status: <span {...stylex.props(styles.strong)}>{isSelected ? "Enabled" : "Disabled"}</span>
      </p>
    </div>
  );
}
