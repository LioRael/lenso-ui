"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./segmented-control.stylex.js";

export type SegmentedControlWidth = "fill" | "fit";

const SegmentedControlContext = React.createContext<SegmentedControlWidth>("fit");

export interface SegmentedControlRootProps extends StyleXProps<BaseRadioGroup.Props<string>> {
  width?: SegmentedControlWidth;
}

export const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  function SegmentedControlRoot({ width = "fit", xstyle, ...props }, ref) {
    return (
      <SegmentedControlContext.Provider value={width}>
        <BaseRadioGroup
          {...props}
          className={
            stylex.props(styles.root, width === "fill" ? styles.fill : styles.fit, xstyle).className
          }
          data-slot="segmented-control"
          data-width={width}
          ref={ref}
        />
      </SegmentedControlContext.Provider>
    );
  },
);

export interface SegmentedControlItemProps extends StyleXProps<BaseRadio.Root.Props<string>> {
  "data-visual-state"?: "focus-visible" | "hover" | "pressed" | undefined;
}

export const SegmentedControlItem = React.forwardRef<HTMLElement, SegmentedControlItemProps>(
  function SegmentedControlItem({ "data-visual-state": visualState, xstyle, ...props }, ref) {
    const width = React.useContext(SegmentedControlContext);
    return (
      <BaseRadio.Root
        {...props}
        className={stylex.props(styles.item, width === "fill" && styles.fillItem, xstyle).className}
        data-slot="segmented-control-item"
        data-visual-state={visualState}
        ref={ref}
      />
    );
  },
);

export const SegmentedControl = {
  Item: SegmentedControlItem,
  Root: SegmentedControlRoot,
} as const;
