"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Field as BaseField } from "@base-ui/react/field";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./text-area.stylex.js";

export type TextAreaRootProps = StyleXProps<BaseField.Root.Props>;
export const TextAreaRoot = React.forwardRef<HTMLDivElement, TextAreaRootProps>(
  function TextAreaRoot({ xstyle, ...props }, ref) {
    return (
      <BaseField.Root
        {...props}
        className={stylex.props(styles.root, xstyle).className}
        data-slot="text-area"
        ref={ref}
      />
    );
  },
);

export type TextAreaLabelProps = StyleXProps<BaseField.Label.Props>;
export const TextAreaLabel = React.forwardRef<HTMLLabelElement, TextAreaLabelProps>(
  function TextAreaLabel({ xstyle, ...props }, ref) {
    return (
      <BaseField.Label
        {...props}
        className={stylex.props(styles.label, xstyle).className}
        data-slot="text-area-label"
        ref={ref}
      />
    );
  },
);

export interface TextAreaControlProps extends StyleXProps<
  React.ComponentPropsWithoutRef<"textarea">
> {
  onValueChange?: BaseField.Control.Props["onValueChange"];
}

export const TextAreaControl = React.forwardRef<HTMLTextAreaElement, TextAreaControlProps>(
  function TextAreaControl({ readOnly, xstyle, ...props }, ref) {
    // Base UI renders an input by default, so its event generics stay input-shaped even when
    // `render` supplies the supported textarea element. Keep the public API textarea-native.
    const fieldControlProps = props as unknown as BaseField.Control.Props;
    return (
      <BaseField.Control
        {...fieldControlProps}
        className={stylex.props(styles.control, xstyle).className}
        data-read-only={readOnly ? "" : undefined}
        data-slot="text-area-control"
        readOnly={readOnly}
        ref={ref}
        render={<textarea />}
      />
    );
  },
);

export type TextAreaDescriptionProps = StyleXProps<BaseField.Description.Props>;
export const TextAreaDescription = React.forwardRef<HTMLParagraphElement, TextAreaDescriptionProps>(
  function TextAreaDescription({ xstyle, ...props }, ref) {
    return (
      <BaseField.Description
        {...props}
        className={stylex.props(styles.description, xstyle).className}
        data-slot="text-area-description"
        ref={ref}
      />
    );
  },
);

export type TextAreaErrorProps = StyleXProps<BaseField.Error.Props>;
export const TextAreaError = React.forwardRef<HTMLDivElement, TextAreaErrorProps>(
  function TextAreaError({ xstyle, ...props }, ref) {
    return (
      <BaseField.Error
        {...props}
        className={stylex.props(styles.error, xstyle).className}
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
