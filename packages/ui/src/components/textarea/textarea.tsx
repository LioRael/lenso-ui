"use client";
import * as React from "react";
import { Textarea as SdkTextarea, type InputState } from "@ui-sdk/react/textarea";
import { slotRender } from "../../utils/sdk-render.js";
import { textAreaStyles, textAreaInputStyles } from "@lenso/tokens/textarea";
import * as stylex from "@stylexjs/stylex";
import { FieldGroupContext } from "../textfield/group-context.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type TextAreaProps = StyleXProps<React.ComponentProps<typeof SdkTextarea>> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  glass?: boolean;
  elastic?: boolean;
};
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
  "data-lenso-slot": slot = "textarea",
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
    <SdkTextarea
      {...props}
      {...compiled}
      ref={inputRef}
      rows={rows}
      cols={cols}
      wrap={wrap}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      style={mergeStyle<InputState>(compiled.style, style)}
      render={slotRender("textarea", slot, props.render)}
    />
  );
}
export const TextArea = Object.assign(TextAreaRoot, { Root: TextAreaRoot });
export type TextAreaRootProps = TextAreaProps;
