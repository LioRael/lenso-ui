"use client";
// HeroUI v3.2.6, Apache-2.0. Behavior uses Base UI's native Form contract.
import { Form as BaseForm } from "@base-ui/react/form";
import { formStyles } from "@lenso/tokens/form";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type FormRootProps<FormValues extends BaseForm.Values = BaseForm.Values> = StyleXProps<
  BaseForm.Props<FormValues>
> & { "data-slot"?: unknown };
export function FormRoot<FormValues extends BaseForm.Values = BaseForm.Values>({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: FormRootProps<FormValues>) {
  const compiled = stylex.props(formStyles.root, xstyle);
  return (
    <BaseForm
      {...props}
      {...compiled}
      style={mergeStyle<BaseForm.State>(compiled.style, style)}
      data-slot={slot ?? "form"}
    />
  );
}
export const Form = Object.assign(FormRoot, { Root: FormRoot });
export type FormProps<FormValues extends BaseForm.Values = BaseForm.Values> =
  FormRootProps<FormValues>;
