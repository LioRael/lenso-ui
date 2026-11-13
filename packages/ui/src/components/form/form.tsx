"use client";
import type * as React from "react";
import { formStyles } from "@lenso/tokens/form";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type FormRootProps = StyleXProps<React.ComponentPropsWithRef<"form">>;
export function FormRoot({ xstyle, style, "data-lenso-slot": slot, ...props }: FormRootProps) {
  const compiled = stylex.props(formStyles.root, xstyle);
  return (
    <form
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "form"}
    />
  );
}
export const Form = Object.assign(FormRoot, { Root: FormRoot });
export type FormProps = FormRootProps;
