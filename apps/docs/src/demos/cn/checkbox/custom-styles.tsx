// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
  indicator: {
    color: "var(--success-foreground)",
  },
});
export function CustomStyles() {
  return (
    <Checkbox id="custom">
      <Checkbox.Content>
        <Checkbox.Control xstyle={styles.control}>
          <Checkbox.Indicator xstyle={styles.indicator} />
        </Checkbox.Control>
        自定义样式复选框
      </Checkbox.Content>
    </Checkbox>
  );
}
