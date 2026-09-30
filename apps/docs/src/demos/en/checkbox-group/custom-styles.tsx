"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { gap: ".75rem" },
  item: { marginTop: 0 },
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
const channels = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" },
] as const;
export function CustomStyles() {
  const labelId = useId();
  return (
    <TextField name="notification-channels">
      <CheckboxGroup
        aria-labelledby={labelId}
        aria-describedby={`${labelId}-help`}
        xstyle={styles.root}
        defaultValue={["email"]}
      >
        <span id={labelId} {...stylex.props(labelStyles.label)}>
          Notification channels
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          Choose how we should reach you for account updates.
        </span>
        {channels.map(({ label, value }) => (
          <Checkbox key={value} value={value} xstyle={styles.item}>
            <Checkbox.Content>
              <Checkbox.Control xstyle={styles.control}>
                <Checkbox.Indicator xstyle={styles.indicator} />
              </Checkbox.Control>
              {label}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </TextField>
  );
}
