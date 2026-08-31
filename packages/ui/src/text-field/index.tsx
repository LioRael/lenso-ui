"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Field as BaseField } from "@base-ui/react/field";
import { XIcon } from "lucide-react";

import { mergeClassName } from "../shared/merge-class-name.js";
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

export interface TextFieldRootProps extends BaseField.Root.Props {
  size?: TextFieldSize;
}

export const TextFieldRoot = React.forwardRef<HTMLDivElement, TextFieldRootProps>(
  function TextFieldRoot(
    { children, className, disabled = false, invalid, size = "default", ...props },
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
          className={mergeClassName(stylex.props(styles.root).className, className)}
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
    const { size } = React.useContext(TextFieldContext);
    const grouped = React.useContext(TextFieldInputGroupContext);

    return (
      <BaseField.Control
        {...props}
        className={mergeClassName(
          stylex.props(
            styles.control,
            grouped ? styles.groupedControl : styles.standaloneControl,
            !grouped && (size === "compact" ? styles.compactControl : styles.defaultControl),
          ).className,
          className,
        )}
        data-read-only={readOnly ? "" : undefined}
        data-size={size}
        data-slot="text-field-control"
        readOnly={readOnly}
        ref={ref}
      />
    );
  },
);

export type TextFieldInputGroupProps = React.ComponentPropsWithRef<"div">;

export const TextFieldInputGroup = React.forwardRef<HTMLDivElement, TextFieldInputGroupProps>(
  function TextFieldInputGroup({ className, ...props }, ref) {
    const { disabled, invalid, size } = React.useContext(TextFieldContext);

    return (
      <TextFieldInputGroupContext.Provider value>
        <div
          {...props}
          className={
            mergeClassName(
              stylex.props(
                styles.inputGroup,
                size === "compact" ? styles.compactInputGroup : styles.defaultInputGroup,
              ).className,
              className,
            ) as string
          }
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

type TextFieldAdornmentProps = React.ComponentPropsWithRef<"span">;

function createAdornment(slot: "leading" | "trailing", style: stylex.CompiledStyles) {
  return React.forwardRef<HTMLSpanElement, TextFieldAdornmentProps>(function TextFieldAdornment(
    { className, ...props },
    ref,
  ) {
    return (
      <span
        {...props}
        className={mergeClassName(stylex.props(style).className, className) as string}
        data-slot={`text-field-${slot}`}
        ref={ref}
      />
    );
  });
}

export const TextFieldLeading = createAdornment("leading", styles.leading);
export const TextFieldTrailing = createAdornment("trailing", styles.trailing);

export interface TextFieldClearProps extends Omit<
  React.ComponentPropsWithRef<"button">,
  "onClick" | "type"
> {
  onClear: React.MouseEventHandler<HTMLButtonElement>;
}

export const TextFieldClear = React.forwardRef<HTMLButtonElement, TextFieldClearProps>(
  function TextFieldClear(
    {
      "aria-label": ariaLabel = "Clear input",
      children,
      className,
      disabled: disabledProp,
      onClear,
      ...props
    },
    ref,
  ) {
    const { disabled: fieldDisabled } = React.useContext(TextFieldContext);

    return (
      <button
        {...props}
        aria-label={ariaLabel}
        className={mergeClassName(stylex.props(styles.clear).className, className) as string}
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
