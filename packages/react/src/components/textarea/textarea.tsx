"use client";
// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { textAreaStyles, textAreaInputStyles } from "@lenso/tokens/textarea";
import { styledPart } from "../../utils/styled.js";
const Control = styledPart(Field.Control, "textarea", textAreaInputStyles.input);
export type TextAreaProps = Omit<
  React.ComponentProps<typeof Control>,
  "render" | "ref" | "onChange" | "onBlur" | "onFocus" | "onKeyDown"
> &
  Pick<
    React.ComponentPropsWithRef<"textarea">,
    "ref" | "rows" | "cols" | "wrap" | "onChange" | "onBlur" | "onFocus" | "onKeyDown"
  > & { variant?: "primary" | "secondary"; fullWidth?: boolean; "data-slot"?: string };
// Field.Control registers the actual textarea for native validity, labels, dirty/touched state and Form errors.
export function TextAreaRoot({
  ref,
  rows,
  cols,
  wrap,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  variant = "primary",
  fullWidth = false,
  xstyle,
  "data-slot": slot = "textarea",
  ...props
}: TextAreaProps) {
  return (
    <Control
      {...props}
      xstyle={[
        textAreaStyles.textarea,
        variant === "secondary" && textAreaInputStyles.secondary,
        fullWidth && textAreaInputStyles.fullWidth,
        xstyle,
      ]}
      render={
        <textarea
          ref={ref}
          data-slot={slot}
          rows={rows}
          cols={cols}
          wrap={wrap}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
      }
    />
  );
}
export const TextArea = Object.assign(TextAreaRoot, { Root: TextAreaRoot });
export type TextAreaRootProps = TextAreaProps;
