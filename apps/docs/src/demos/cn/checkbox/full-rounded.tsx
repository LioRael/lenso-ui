// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: ".75rem",
  },
  label: {
    color: "var(--muted)",
  },
  smallIndicator: {
    "--checkbox-checkmark-size": ".5rem",
  },
  extraLargeIndicator: {
    "--checkbox-checkmark-size": "1rem",
  },
  small: {
    width: ".75rem",
    height: ".75rem",
    borderRadius: "9999px",
    "::before": {
      borderRadius: "9999px",
    },
  },
  medium: {
    width: "1rem",
    height: "1rem",
    borderRadius: "9999px",
    "::before": {
      borderRadius: "9999px",
    },
  },
  large: {
    width: "1.25rem",
    height: "1.25rem",
    borderRadius: "9999px",
    "::before": {
      borderRadius: "9999px",
    },
  },
  extraLarge: {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    "::before": {
      borderRadius: "9999px",
    },
  },
});
export function FullRounded() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(labelStyles.label, styles.label)}>圆角复选框</span>
        <Checkbox name="small-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.small}>
              <Checkbox.Indicator xstyle={styles.smallIndicator} />
            </Checkbox.Control>
            小尺寸
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="default-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.medium}>
              <Checkbox.Indicator />
            </Checkbox.Control>
            默认尺寸
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="large-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.large}>
              <Checkbox.Indicator />
            </Checkbox.Control>
            大尺寸
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div {...stylex.props(styles.section)}>
        <Checkbox name="xl-rounded">
          <Checkbox.Content>
            <Checkbox.Control xstyle={styles.extraLarge}>
              <Checkbox.Indicator xstyle={styles.extraLargeIndicator} />
            </Checkbox.Control>
            特大尺寸
          </Checkbox.Content>
        </Checkbox>
      </div>
    </div>
  );
}
