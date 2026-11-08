"use client";
import * as stylex from "@stylexjs/stylex";
import { Fieldset, TextField } from "@lenso/ui";
import { useState } from "react";
import type { ComponentProps } from "react";
export interface TextFieldStoryProps extends Pick<
  ComponentProps<typeof TextField>,
  "disabled" | "invalid" | "fullWidth"
> {
  clearable?: boolean;
  readOnly?: boolean;
}
export const initialArgs: TextFieldStoryProps = /* story-args:start */ {
  disabled: false,
  invalid: false,
  fullWidth: false,
  clearable: true,
  readOnly: false,
}; /* story-args:end */
const styles = stylex.create({ group: { width: 402, maxWidth: "100%" } });
export function Basic(overrides: TextFieldStoryProps) {
  const { clearable, readOnly, ...args } = { ...initialArgs, ...overrides };
  const [name, setName] = useState("");
  return (
    <Fieldset aria-label="Contact details" xstyle={styles.group}>
      <Fieldset.Group>
        <TextField name="name" {...args}>
          <TextField.Label>Name</TextField.Label>
          <TextField.Input
            placeholder="Name"
            value={name}
            onValueChange={setName}
            clearable={clearable}
            readOnly={readOnly}
          />
        </TextField>
        <TextField name="email" {...args}>
          <TextField.Label>Email</TextField.Label>
          <TextField.Input
            placeholder="Email"
            type="email"
            clearable={clearable}
            readOnly={readOnly}
          />
        </TextField>
        <TextField name="company" {...args}>
          <TextField.Label>Company</TextField.Label>
          <TextField.Input
            placeholder="Company"
            defaultValue="Acme"
            clearable={clearable}
            readOnly={readOnly}
          />
        </TextField>
      </Fieldset.Group>
    </Fieldset>
  );
}
