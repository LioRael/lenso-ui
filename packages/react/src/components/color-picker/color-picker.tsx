"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX; RAC context retained. */
import { ColorPicker } from "react-aria-components/ColorPicker";
import { DialogTrigger, Popover } from "react-aria-components/Popover";
import { Dialog } from "react-aria-components/Dialog";
import { Button } from "react-aria-components/Button";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { colorPickerStyles as styles } from "@lenso/tokens/color-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { racPart } from "../date-input-group/rac-part.js";
import { pickerEnterTransform } from "../date-picker/date-picker.js";
export type ColorPickerRootProps = StyleXProps<ComponentPropsWithRef<typeof ColorPicker>>;
export function ColorPickerRoot({ children, xstyle, ...props }: ColorPickerRootProps) {
  const compiled = stylex.props(styles.root, xstyle);
  return (
    <ColorPicker {...props}>
      {(state) => (
        <DialogTrigger>
          <div {...compiled} data-slot="color-picker">
            {typeof children === "function" ? children(state) : children}
          </div>
        </DialogTrigger>
      )}
    </ColorPicker>
  );
}
export const ColorPickerTrigger = racPart(
  Button,
  "color-picker-trigger",
  (state: { isFocusVisible: boolean; isDisabled: boolean }) => [
    styles.trigger,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
const Overlay = racPart(
  Popover,
  "color-picker-popover",
  (state: { isEntering: boolean; isExiting: boolean }) => [
    styles.popover,
    state.isEntering && styles.entering,
    state.isExiting && styles.exiting,
  ],
);
export function ColorPickerPopover({
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Popover>>) {
  const container = useThemePortalContainer();
  return (
    <Overlay
      placement="bottom start"
      {...(container ? { UNSTABLE_portalContainer: container } : {})}
      {...props}
      style={(state) =>
        ({
          "--picker-enter-from": pickerEnterTransform(state.placement),
          ...(typeof style === "function" ? style(state) : style),
        }) as CSSProperties
      }
    />
  );
}
export function ColorPickerDialog({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Dialog>>) {
  const compiled = stylex.props(styles.dialog, xstyle);
  return (
    <Dialog
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "color-picker-dialog"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
