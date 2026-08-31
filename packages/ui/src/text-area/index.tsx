"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Field as BaseField } from "@base-ui/react/field";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./text-area.stylex.js";

export const TextAreaRoot = React.forwardRef<HTMLDivElement, BaseField.Root.Props>(
  function TextAreaRoot({ className, ...props }, ref) {
    return (
      <BaseField.Root
        {...props}
        className={mergeClassName(stylex.props(styles.root).className, className)}
        data-slot="text-area"
        ref={ref}
      />
    );
  },
);

export const TextAreaLabel = React.forwardRef<HTMLLabelElement, BaseField.Label.Props>(
  function TextAreaLabel({ className, ...props }, ref) {
    return (
      <BaseField.Label
        {...props}
        className={mergeClassName(stylex.props(styles.label).className, className)}
        data-slot="text-area-label"
        ref={ref}
      />
    );
  },
);

export interface TextAreaControlProps extends Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "className"
> {
  className?: BaseField.Control.Props["className"];
  onValueChange?: BaseField.Control.Props["onValueChange"];
}

export const TextAreaControl = React.forwardRef<HTMLTextAreaElement, TextAreaControlProps>(
  function TextAreaControl({ className, readOnly, ...props }, ref) {
    // Base UI renders an input by default, so its event generics stay input-shaped even when
    // `render` supplies the supported textarea element. Keep the public API textarea-native.
    const fieldControlProps = props as unknown as BaseField.Control.Props;
    return (
      <BaseField.Control
        {...fieldControlProps}
        className={mergeClassName(stylex.props(styles.control).className, className)}
        data-read-only={readOnly ? "" : undefined}
        data-slot="text-area-control"
        readOnly={readOnly}
        ref={ref}
        render={<textarea />}
      />
    );
  },
);

export const TextAreaDescription = React.forwardRef<
  HTMLParagraphElement,
  BaseField.Description.Props
>(function TextAreaDescription({ className, ...props }, ref) {
  return (
    <BaseField.Description
      {...props}
      className={mergeClassName(stylex.props(styles.description).className, className)}
      data-slot="text-area-description"
      ref={ref}
    />
  );
});

export const TextAreaError = React.forwardRef<HTMLDivElement, BaseField.Error.Props>(
  function TextAreaError({ className, ...props }, ref) {
    return (
      <BaseField.Error
        {...props}
        className={mergeClassName(stylex.props(styles.error).className, className)}
        data-slot="text-area-error"
        ref={ref}
      />
    );
  },
);

export const TextArea = {
  Control: TextAreaControl,
  Description: TextAreaDescription,
  Error: TextAreaError,
  Label: TextAreaLabel,
  Root: TextAreaRoot,
} as const;
