"use client";
import { useId, type ComponentProps } from "react";
import { TextField, Input, Label, Description } from "@lenso/ui";

export type TextFieldStoryProps = Pick<
  ComponentProps<typeof TextField>,
  "disabled" | "invalid" | "fullWidth"
> & { label: string; placeholder: string; readOnly: boolean };
export const initialArgs: TextFieldStoryProps = /* story-args:start */ {
  label: "Organization",
  placeholder: "Your organization",
  disabled: false,
  invalid: false,
  fullWidth: false,
  readOnly: false,
}; /* story-args:end */
export function Basic(overrides: TextFieldStoryProps) {
  const { label, placeholder, readOnly, ...props } = { ...initialArgs, ...overrides };
  const id = useId();
  return (
    <TextField {...props} name="organization">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder={placeholder} readOnly={readOnly} />
      <Description>Shown on your profile.</Description>
    </TextField>
  );
}
