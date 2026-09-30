"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Button, Checkbox, CheckboxGroup, FieldError, Form, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", gap: "1rem", paddingInline: "1rem" },
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
            Preferences
          </span>
          <Checkbox value="email">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              Email notifications
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="sms">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              SMS notifications
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="push">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              Push notifications
            </Checkbox.Content>
          </Checkbox>
        </CheckboxGroup>
        <FieldError>Please select at least one notification method.</FieldError>
      </TextField>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
