"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./switch.stylex.js";

export type SwitchSize = "compact" | "default";

export interface SwitchRootProps extends BaseSwitch.Root.Props {
  "data-visual-state"?: "focus-visible" | "hover" | "pressed" | undefined;
  size?: SwitchSize;
}

export const SwitchRoot = React.forwardRef<HTMLElement, SwitchRootProps>(function SwitchRoot(
  { className, children, "data-visual-state": visualState, size = "default", ...props },
  ref,
) {
  const interactive = visualState === "hover" || visualState === "pressed";
  return (
    <BaseSwitch.Root
      {...props}
      className={(state) => {
        const generated = stylex.props(
          styles.root,
          size === "compact" ? styles.compact : styles.defaultSize,
          state.checked && styles.checked,
          interactive &&
            (size === "compact" ? styles.compactInteractive : styles.defaultInteractive),
          state.checked && interactive && styles.checkedInteractive,
          visualState === "pressed" && styles.pressed,
          visualState === "focus-visible" && styles.focusVisible,
          state.disabled && styles.disabled,
        ).className;
        const custom = typeof className === "function" ? className(state) : className;
        return custom ? `${generated} ${custom}` : generated;
      }}
      data-size={size}
      data-slot="switch"
      data-visual-state={visualState}
      ref={ref}
    >
      <span aria-hidden="true" data-slot="switch-track" {...stylex.props(styles.track)} />
      {children}
      <span
        aria-hidden="true"
        data-slot="switch-pressed-layer"
        {...stylex.props(styles.pressedLayer)}
      />
      <span
        aria-hidden="true"
        data-slot="switch-focus-layer"
        {...stylex.props(styles.focusLayer)}
      />
    </BaseSwitch.Root>
  );
});

export const SwitchThumb = React.forwardRef<HTMLSpanElement, BaseSwitch.Thumb.Props>(
  function SwitchThumb({ className, ...props }, ref) {
    return (
      <BaseSwitch.Thumb
        {...props}
        className={mergeClassName(stylex.props(styles.thumb).className, className)}
        data-slot="switch-thumb"
        ref={ref}
      />
    );
  },
);

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
