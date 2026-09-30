"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: ".75rem" },
  status: { fontSize: ".875rem", color: "var(--muted)" },
  strong: { fontWeight: 500 },
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
          Email notifications
        </Checkbox.Content>
      </Checkbox>
      <p {...stylex.props(styles.status)}>
        Status: <span {...stylex.props(styles.strong)}>{isSelected ? "Enabled" : "Disabled"}</span>
      </p>
    </div>
  );
}
