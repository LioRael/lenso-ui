"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Field as BaseField } from "@base-ui/react/field";
import { XIcon } from "lucide-react";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./text-field.stylex.js";

export type TextFieldSize = "compact" | "default";

interface TextFieldContextValue {
  disabled: boolean;
  invalid: boolean;
  size: TextFieldSize;
}

const TextFieldContext = React.createContext<TextFieldContextValue>({
  disabled: false,
  invalid: false,
  size: "default",
});

const TextFieldInputGroupContext = React.createContext(false);

export interface TextFieldRootProps extends StyleXProps<BaseField.Root.Props> {
  size?: TextFieldSize;
}

export const TextFieldRoot = React.forwardRef<HTMLDivElement, TextFieldRootProps>(
  function TextFieldRoot(
    { children, disabled = false, invalid, size = "default", xstyle, ...props },
    ref,
  ) {
    const contextValue = React.useMemo(
      () => ({ disabled, invalid: invalid === true, size }),
      [disabled, invalid, size],
    );

    return (
      <TextFieldContext.Provider value={contextValue}>
        <BaseField.Root
          {...props}
          className={stylex.props(styles.root, xstyle).className}
          data-disabled={disabled ? "" : undefined}
          data-invalid={invalid === true ? "" : undefined}
          data-size={size}
          data-slot="text-field"
          disabled={disabled}
          invalid={invalid}
          ref={ref}
        >
          {children}
        </BaseField.Root>
      </TextFieldContext.Provider>
    );
  },
);

export const TextFieldLabel = React.forwardRef<
  HTMLLabelElement,
  StyleXProps<BaseField.Label.Props>
>(function TextFieldLabel({ xstyle, ...props }, ref) {
  return (
    <BaseField.Label
      {...props}
      className={stylex.props(styles.label, xstyle).className}
      data-slot="text-field-label"
      ref={ref}
    />
  );
});

export const TextFieldControl = React.forwardRef<HTMLElement, StyleXProps<BaseField.Control.Props>>(
  function TextFieldControl({ readOnly, xstyle, ...props }, ref) {
    const { size } = React.useContext(TextFieldContext);
    const grouped = React.useContext(TextFieldInputGroupContext);

    return (
      <BaseField.Control
        {...props}
        className={
          stylex.props(
            styles.control,
            grouped ? styles.groupedControl : styles.standaloneControl,
            !grouped && (size === "compact" ? styles.compactControl : styles.defaultControl),
            xstyle,
          ).className
        }
        data-read-only={readOnly ? "" : undefined}
        data-size={size}
        data-slot="text-field-control"
        readOnly={readOnly}
        ref={ref}
      />
    );
  },
);

export type TextFieldInputGroupProps = StyleXProps<React.ComponentPropsWithRef<"div">>;

export const TextFieldInputGroup = React.forwardRef<HTMLDivElement, TextFieldInputGroupProps>(
  function TextFieldInputGroup({ xstyle, ...props }, ref) {
    const { disabled, invalid, size } = React.useContext(TextFieldContext);

    return (
      <TextFieldInputGroupContext.Provider value>
        <div
          {...props}
          {...stylex.props(
            styles.inputGroup,
            size === "compact" ? styles.compactInputGroup : styles.defaultInputGroup,
            xstyle,
          )}
          data-disabled={disabled ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          data-size={size}
          data-slot="text-field-input-group"
          ref={ref}
        />
      </TextFieldInputGroupContext.Provider>
    );
  },
);

type TextFieldAdornmentProps = StyleXProps<React.ComponentPropsWithRef<"span">>;

function createAdornment(slot: "leading" | "trailing", style: stylex.CompiledStyles) {
  return React.forwardRef<HTMLSpanElement, TextFieldAdornmentProps>(function TextFieldAdornment(
    { xstyle, ...props },
    ref,
  ) {
    return (
      <span
        {...props}
        {...stylex.props(style, xstyle)}
        data-slot={`text-field-${slot}`}
        ref={ref}
      />
    );
  });
}

export const TextFieldLeading = createAdornment("leading", styles.leading);
export const TextFieldTrailing = createAdornment("trailing", styles.trailing);

export interface TextFieldClearProps extends Omit<
  StyleXProps<React.ComponentPropsWithRef<"button">>,
  "onClick" | "type"
> {
  onClear: React.MouseEventHandler<HTMLButtonElement>;
}

export const TextFieldClear = React.forwardRef<HTMLButtonElement, TextFieldClearProps>(
  function TextFieldClear(
    {
      "aria-label": ariaLabel = "Clear input",
      children,
      disabled: disabledProp,
      onClear,
      xstyle,
      ...props
    },
    ref,
  ) {
    const { disabled: fieldDisabled } = React.useContext(TextFieldContext);

    return (
      <button
        {...props}
        aria-label={ariaLabel}
        {...stylex.props(styles.clear, xstyle)}
        data-slot="text-field-clear"
        disabled={fieldDisabled || disabledProp}
        onClick={onClear}
        ref={ref}
        type="button"
      >
        {children === undefined ? (
          <XIcon aria-hidden="true" focusable="false" {...stylex.props(styles.clearIcon)} />
        ) : (
          children
        )}
      </button>
    );
  },
);

export const TextFieldDescription = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseField.Description.Props>
>(function TextFieldDescription({ xstyle, ...props }, ref) {
  return (
    <BaseField.Description
      {...props}
      className={stylex.props(styles.description, xstyle).className}
      data-slot="text-field-description"
      ref={ref}
    />
  );
});

export const TextFieldError = React.forwardRef<HTMLDivElement, StyleXProps<BaseField.Error.Props>>(
  function TextFieldError({ xstyle, ...props }, ref) {
    return (
      <BaseField.Error
        {...props}
        className={stylex.props(styles.error, xstyle).className}
        data-slot="text-field-error"
        ref={ref}
      />
    );
  },
);

export const TextField = {
  Clear: TextFieldClear,
  Control: TextFieldControl,
  Description: TextFieldDescription,
  Error: TextFieldError,
  InputGroup: TextFieldInputGroup,
  Label: TextFieldLabel,
  Leading: TextFieldLeading,
  Root: TextFieldRoot,
  Trailing: TextFieldTrailing,
} as const;
