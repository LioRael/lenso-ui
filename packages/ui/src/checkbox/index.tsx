"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./checkbox.stylex.js";

export type CheckboxRootProps = StyleXProps<BaseCheckbox.Root.Props>;
export const CheckboxRoot = React.forwardRef<HTMLElement, CheckboxRootProps>(function CheckboxRoot(
  { children, xstyle, ...props },
  ref,
) {
  return (
    <BaseCheckbox.Root
      {...props}
      className={stylex.props(styles.root, xstyle).className}
      data-slot="checkbox"
      ref={ref}
    >
      {children}
      <span
        aria-hidden="true"
        data-slot="checkbox-focus-layer"
        {...stylex.props(styles.focusLayer)}
      />
    </BaseCheckbox.Root>
  );
});

export type CheckboxIndicatorProps = StyleXProps<Omit<BaseCheckbox.Indicator.Props, "keepMounted">>;

export const CheckboxIndicator = React.forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({ children, xstyle, ...props }, ref) {
    return (
      <BaseCheckbox.Indicator
        {...props}
        className={(state) => {
          return stylex.props(
            styles.indicator,
            children === undefined &&
              (state.indeterminate
                ? styles.indeterminateMark
                : state.checked
                  ? styles.checkedMark
                  : null),
            children === undefined && state.disabled && styles.disabledMark,
            xstyle,
          ).className;
        }}
        data-slot="checkbox-indicator"
        keepMounted
        ref={ref}
      >
        {children}
      </BaseCheckbox.Indicator>
    );
  },
);

export type CheckboxLabelProps = StyleXProps<React.ComponentPropsWithoutRef<"span">>;
export const CheckboxLabel = React.forwardRef<HTMLSpanElement, CheckboxLabelProps>(
  function CheckboxLabel({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        className={stylex.props(styles.label, xstyle).className}
        data-slot="checkbox-label"
        ref={ref}
      />
    );
  },
);

export const Checkbox = {
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Root: CheckboxRoot,
} as const;
