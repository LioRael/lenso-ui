"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  control: {
    backgroundColor: "var(--success-soft)",
    "::before": {
      backgroundColor: {
        default: "var(--success)",
        ":is([data-slot='checkbox']:hover *)": "var(--success)",
        ":is([data-slot='checkbox'][data-invalid] *)": "var(--success)",
      },
    },
  },
  indicator: { color: "var(--success-foreground)" },
});
export function CustomStyles() {
  return (
    <Checkbox id="custom">
      <Checkbox.Content>
        <Checkbox.Control xstyle={styles.control}>
          <Checkbox.Indicator xstyle={styles.indicator} />
        </Checkbox.Control>
        Custom styled checkbox
      </Checkbox.Content>
    </Checkbox>
  );
}
