"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./checkbox.stylex.js";

export const CheckboxRoot = React.forwardRef<HTMLElement, BaseCheckbox.Root.Props>(
  function CheckboxRoot({ children, className, ...props }, ref) {
    return (
      <BaseCheckbox.Root
        {...props}
        className={mergeClassName(stylex.props(styles.root).className, className)}
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
  },
);

export type CheckboxIndicatorProps = Omit<BaseCheckbox.Indicator.Props, "keepMounted">;

export const CheckboxIndicator = React.forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({ children, className, ...props }, ref) {
    return (
      <BaseCheckbox.Indicator
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.indicator,
            children === undefined &&
              (state.indeterminate
                ? styles.indeterminateMark
                : state.checked
                  ? styles.checkedMark
                  : null),
            children === undefined && state.disabled && styles.disabledMark,
          ).className;
          const custom = typeof className === "function" ? className(state) : className;
          return [generated, custom].filter(Boolean).join(" ");
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

export const CheckboxLabel = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function CheckboxLabel({ className, ...props }, ref) {
  return (
    <span
      {...props}
      className={[stylex.props(styles.label).className, className].filter(Boolean).join(" ")}
      data-slot="checkbox-label"
      ref={ref}
    />
  );
});

export const Checkbox = {
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Root: CheckboxRoot,
} as const;
