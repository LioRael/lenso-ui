// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Button, Checkbox, CheckboxGroup, FieldError, Form, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    paddingInline: "1rem",
  },
});
export function Validation() {
  const labelId = useId();
  return (
    <Form
      xstyle={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const values = new FormData(e.currentTarget).getAll("preferences");
        alert(`Selected preferences: ${values.join(", ")}`);
      }}
    >
      <TextField
        name="preferences"
        validate={(value) =>
          Array.isArray(value) && value.length > 0
            ? null
            : "Please select at least one notification method."
        }
      >
        <CheckboxGroup aria-labelledby={labelId}>
          <span id={labelId} {...stylex.props(labelStyles.label)}>
            偏好设置
          </span>
          <Checkbox value="email">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              邮件通知
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="sms">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              短信通知
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="push">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              推送通知
            </Checkbox.Content>
          </Checkbox>
        </CheckboxGroup>
        <FieldError>请至少选择一种通知方式。</FieldError>
      </TextField>
      <Button type="submit">提交</Button>
    </Form>
  );
}
