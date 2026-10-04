// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    gap: ".75rem",
  },
  item: {
    marginTop: 0,
  },
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
const channels = [
  {
    label: "电子邮件",
    value: "email",
  },
  {
    label: "短信",
    value: "sms",
  },
  {
    label: "推送",
    value: "push",
  },
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
          通知渠道
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          选择我们通过何种方式向您发送账户更新。
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
