"use client";
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { textAreaStyles, textAreaInputStyles } from "@lenso/tokens/textarea";
import * as stylex from "@stylexjs/stylex";
import { FieldGroupContext } from "../textfield/group-context.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type TextAreaProps = Omit<
  StyleXProps<Field.Control.Props>,
  "render" | "ref" | "onChange" | "onBlur" | "onFocus" | "onKeyDown"
> &
  Pick<
    React.ComponentPropsWithRef<"textarea">,
    "ref" | "rows" | "cols" | "wrap" | "onChange" | "onBlur" | "onFocus" | "onKeyDown"
  > & {
    variant?: "primary" | "secondary";
    fullWidth?: boolean;
    /** Opt into glass for a field that floats above content. */
    glass?: boolean;
    /** Opt into elastic pointer feedback while retaining native text editing. */
    elastic?: boolean;
    "data-slot"?: string;
  };
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
  glass = false,
  elastic = false,
  xstyle,
  style,
  "data-slot": slot = "textarea",
  ...props
}: TextAreaProps) {
  const grouped = React.useContext(FieldGroupContext);
  const inputRef = useFocusMethodRef(
    useElasticRef(useGlassRef(ref, glass), { enabled: elastic && !props.disabled }),
  );
  const compiled = stylex.props(
    glass && liquidMaterialStyles.small,
    textAreaInputStyles.input,
    glass && textAreaInputStyles.fieldGlass,
    textAreaStyles.textarea,
    rows === 1 && textAreaStyles.singleLine,
    elastic && textAreaInputStyles.elastic,
    !glass && variant === "secondary" && textAreaInputStyles.secondary,
    fullWidth && textAreaInputStyles.fullWidth,
    grouped && !glass && textAreaInputStyles.formGrouped,
    xstyle,
  );
  return (
    <Field.Control
      {...props}
      {...compiled}
      style={mergeStyle<Field.Control.State>(compiled.style, style)}
      data-slot="textarea"
      render={
        <textarea
          ref={inputRef}
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
