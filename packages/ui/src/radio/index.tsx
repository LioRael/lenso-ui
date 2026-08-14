"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./radio.stylex.js";

export const RadioGroupRoot = React.forwardRef<HTMLDivElement, BaseRadioGroup.Props>(
  function RadioGroupRoot({ className, ...props }, ref) {
    return <BaseRadioGroup {...props} className={className} data-slot="radio-group" ref={ref} />;
  },
);

export const RadioGroupItem = React.forwardRef<HTMLElement, BaseRadio.Root.Props>(
  function RadioGroupItem({ className, ...props }, ref) {
    return (
      <BaseRadio.Root
        {...props}
        className={mergeClassName(stylex.props(styles.item).className, className)}
        data-slot="radio-group-item"
        ref={ref}
      />
    );
  },
);

export type RadioGroupIndicatorProps = Omit<BaseRadio.Indicator.Props, "keepMounted">;

export const RadioGroupIndicator = React.forwardRef<HTMLSpanElement, RadioGroupIndicatorProps>(
  function RadioGroupIndicator({ children, className, ...props }, ref) {
    return (
      <BaseRadio.Indicator
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.indicator,
            children === undefined && state.checked && styles.selected,
          ).className;
          const custom = typeof className === "function" ? className(state) : className;
          return custom ? `${generated} ${custom}` : generated;
        }}
        data-slot="radio-group-indicator"
        keepMounted
        ref={ref}
      >
        {children}
        <span
          aria-hidden="true"
          data-slot="radio-group-pressed-layer"
          {...stylex.props(styles.pressedLayer)}
        />
        <span
          aria-hidden="true"
          data-slot="radio-group-focus-layer"
          {...stylex.props(styles.focusLayer)}
        />
      </BaseRadio.Indicator>
    );
  },
);

export const RadioGroup = {
  Indicator: RadioGroupIndicator,
  Item: RadioGroupItem,
  Root: RadioGroupRoot,
} as const;
