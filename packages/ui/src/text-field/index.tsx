"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Field as BaseField } from "@base-ui/react/field";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./text-field.stylex.js";

export const TextFieldRoot = React.forwardRef<HTMLDivElement, BaseField.Root.Props>(
  function TextFieldRoot({ className, ...props }, ref) {
    return (
      <BaseField.Root
        {...props}
        className={mergeClassName(stylex.props(styles.root).className, className)}
        data-slot="text-field"
        ref={ref}
      />
    );
  },
);

export const TextFieldLabel = React.forwardRef<HTMLLabelElement, BaseField.Label.Props>(
  function TextFieldLabel({ className, ...props }, ref) {
    return (
      <BaseField.Label
        {...props}
        className={mergeClassName(stylex.props(styles.label).className, className)}
        data-slot="text-field-label"
        ref={ref}
      />
    );
  },
);

export const TextFieldControl = React.forwardRef<HTMLElement, BaseField.Control.Props>(
  function TextFieldControl({ className, readOnly, ...props }, ref) {
    return (
      <BaseField.Control
        {...props}
        className={mergeClassName(stylex.props(styles.control).className, className)}
        data-read-only={readOnly ? "" : undefined}
        data-slot="text-field-control"
        readOnly={readOnly}
        ref={ref}
      />
    );
  },
);

export const TextFieldDescription = React.forwardRef<HTMLDivElement, BaseField.Description.Props>(
  function TextFieldDescription({ className, ...props }, ref) {
    return (
      <BaseField.Description
        {...props}
        className={mergeClassName(stylex.props(styles.description).className, className)}
        data-slot="text-field-description"
        ref={ref}
      />
    );
  },
);

export const TextFieldError = React.forwardRef<HTMLDivElement, BaseField.Error.Props>(
  function TextFieldError({ className, ...props }, ref) {
    return (
      <BaseField.Error
        {...props}
        className={mergeClassName(stylex.props(styles.error).className, className)}
        data-slot="text-field-error"
        ref={ref}
      />
    );
  },
);

export const TextField = {
  Control: TextFieldControl,
  Description: TextFieldDescription,
  Error: TextFieldError,
  Label: TextFieldLabel,
  Root: TextFieldRoot,
} as const;
