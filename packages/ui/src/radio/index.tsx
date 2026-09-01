"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./radio.stylex.js";

export type RadioGroupRootProps = StyleXProps<BaseRadioGroup.Props>;
export const RadioGroupRoot = React.forwardRef<HTMLDivElement, RadioGroupRootProps>(
  function RadioGroupRoot({ xstyle, ...props }, ref) {
    return (
      <BaseRadioGroup
        {...props}
        className={stylex.props(xstyle).className}
        data-slot="radio-group"
        ref={ref}
      />
    );
  },
);

export type RadioGroupItemProps = StyleXProps<BaseRadio.Root.Props>;
export const RadioGroupItem = React.forwardRef<HTMLElement, RadioGroupItemProps>(
  function RadioGroupItem({ xstyle, ...props }, ref) {
    return (
      <BaseRadio.Root
        {...props}
        className={stylex.props(styles.item, xstyle).className}
        data-slot="radio-group-item"
        ref={ref}
      />
    );
  },
);

export type RadioGroupIndicatorProps = StyleXProps<Omit<BaseRadio.Indicator.Props, "keepMounted">>;

export const RadioGroupIndicator = React.forwardRef<HTMLSpanElement, RadioGroupIndicatorProps>(
  function RadioGroupIndicator({ children, xstyle, ...props }, ref) {
    return (
      <BaseRadio.Indicator
        {...props}
        className={(state) => {
          return stylex.props(
            styles.indicator,
            children === undefined && state.checked && styles.selected,
            xstyle,
          ).className;
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
