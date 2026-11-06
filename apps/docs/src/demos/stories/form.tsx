"use client";
import type { ComponentProps } from "react";
import { Form, Input, TextField, Button, Label } from "@lenso/ui";
export interface FormStoryProps extends Pick<
  ComponentProps<typeof Input>,
  "required" | "disabled" | "placeholder"
> {
  label: string;
}
export const initialArgs: FormStoryProps = /* story-args:start */ {
  label: "Email",
  required: true,
  disabled: false,
  placeholder: "you@example.com",
}; /* story-args:end */

export function Preview(overrides: FormStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { label, ...input } = args;
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <TextField name="email">
        <Label>{label}</Label>
        <Input type="email" {...input} />
      </TextField>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
