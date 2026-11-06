"use client";
import { TextField, Label, Input, FieldError } from "@lenso/ui";
export interface FieldErrorStoryProps {
  message: string;
  invalid: boolean;
}
export const initialArgs: FieldErrorStoryProps = /* story-args:start */ {
  message: "Username must be at least 3 characters",
  invalid: true,
}; /* story-args:end */

export function Preview(overrides: FieldErrorStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TextField invalid={args.invalid}>
      <Label>Username</Label>
      <Input defaultValue="jr" />
      {args.invalid && <FieldError match>{args.message}</FieldError>}
    </TextField>
  );
}
