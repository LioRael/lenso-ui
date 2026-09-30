"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  section: { display: "flex", flexDirection: "column", gap: ".75rem" },
  label: { color: "var(--muted)" },
  smallIndicator: { "--checkbox-checkmark-size": ".5rem" },
  extraLargeIndicator: { "--checkbox-checkmark-size": "1rem" },
  small: {
    width: ".75rem",
    height: ".75rem",
    borderRadius: "9999px",
    "::before": { borderRadius: "9999px" },
  },
  medium: {
    width: "1rem",
    height: "1rem",
    borderRadius: "9999px",
    "::before": { borderRadius: "9999px" },
  },
  large: {
    width: "1.25rem",
    height: "1.25rem",
    borderRadius: "9999px",
    "::before": { borderRadius: "9999px" },
  },
  extraLarge: {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    "::before": { borderRadius: "9999px" },
  },
});
export function FullRounded() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(labelStyles.label, styles.label)}>Rounded checkboxes</span>
        <Checkbox name="small-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.small}>
              <Checkbox.Indicator xstyle={styles.smallIndicator} />
            </Checkbox.Control>
            Small size
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="default-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.medium}>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Default size
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="large-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.large}>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Large size
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="xl-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.extraLarge}>
              <Checkbox.Indicator xstyle={styles.extraLargeIndicator} />
            </Checkbox.Control>
            Extra large size
          </Checkbox.Content>
        </Checkbox>
      </div>
    </div>
  );
}
