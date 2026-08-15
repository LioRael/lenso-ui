"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./switch.stylex.js";

export type SwitchSize = "compact" | "default";
type SwitchFeedbackDirection = "from-checked" | "from-unchecked";

const SwitchFeedbackContext = React.createContext<{
  direction: SwitchFeedbackDirection | null;
  size: SwitchSize;
}>({
  direction: null,
  size: "default",
});

export interface SwitchRootProps extends BaseSwitch.Root.Props {
  "data-visual-state"?: "focus-visible" | "hover" | "pressed" | undefined;
  size?: SwitchSize;
}

export const SwitchRoot = React.forwardRef<HTMLElement, SwitchRootProps>(function SwitchRoot(
  {
    className,
    children,
    "data-visual-state": visualState,
    onCheckedChange,
    onPointerEnter,
    onPointerLeave,
    onAnimationEnd,
    size = "default",
    ...props
  },
  ref,
) {
  const [hovered, setHovered] = React.useState(false);
  const [hoverConsumed, setHoverConsumed] = React.useState(false);
  const [switchFeedback, setSwitchFeedback] = React.useState<SwitchFeedbackDirection | null>(null);
  const interactive =
    !hoverConsumed && (hovered || visualState === "hover" || visualState === "pressed");
  return (
    <BaseSwitch.Root
      {...props}
      onCheckedChange={(checked, event) => {
        if (hovered && hoverConsumed) {
          setSwitchFeedback(checked ? "from-unchecked" : "from-checked");
        }
        setHoverConsumed(true);
        onCheckedChange?.(checked, event);
      }}
      onPointerEnter={(event) => {
        setHovered(true);
        setHoverConsumed(false);
        setSwitchFeedback(null);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        setHoverConsumed(false);
        setSwitchFeedback(null);
        onPointerLeave?.(event);
      }}
      onAnimationEnd={(event) => {
        const target = event.target;
        if (
          switchFeedback !== null &&
          target instanceof HTMLElement &&
          target.dataset.slot === "switch-thumb"
        ) {
          setSwitchFeedback(null);
        }
        onAnimationEnd?.(event);
      }}
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
      <SwitchFeedbackContext.Provider value={{ direction: switchFeedback, size }}>
        {children}
      </SwitchFeedbackContext.Provider>
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
    const feedback = React.useContext(SwitchFeedbackContext);
    return (
      <BaseSwitch.Thumb
        {...props}
        className={mergeClassName(
          stylex.props(
            styles.thumb,
            feedback.direction === "from-checked" &&
              (feedback.size === "compact"
                ? styles.compactFeedbackFromChecked
                : styles.defaultFeedbackFromChecked),
            feedback.direction === "from-unchecked" &&
              (feedback.size === "compact"
                ? styles.compactFeedbackFromUnchecked
                : styles.defaultFeedbackFromUnchecked),
          ).className,
          className,
        )}
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
