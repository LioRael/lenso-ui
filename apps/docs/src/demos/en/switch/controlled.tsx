"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Switch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1rem" },
  status: { fontSize: ".875rem", color: "var(--muted)" },
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
          Enable notifications
        </Switch.Content>
      </Switch>
      <p {...stylex.props(styles.status)}>Switch is {isSelected ? "on" : "off"}</p>
    </div>
  );
}
