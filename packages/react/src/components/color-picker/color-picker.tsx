"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX; RAC context retained. */
import { ColorPicker } from "react-aria-components/ColorPicker";
import { DialogTrigger, Popover } from "react-aria-components/Popover";
import { Dialog } from "react-aria-components/Dialog";
import { Button } from "react-aria-components/Button";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { colorPickerStyles as styles } from "@lenso/tokens/color-picker";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { racPart } from "../date-input-group/rac-part.js";
import { pickerEnterTransform } from "../date-picker/date-picker.js";
const Wrapper = styledPart("div", "color-picker", styles.root);
export type ColorPickerRootProps = StyleXProps<ComponentPropsWithRef<typeof ColorPicker>>;
export function ColorPickerRoot({ children, xstyle, ...props }: ColorPickerRootProps) {
  return (
    <ColorPicker {...props}>
      {(state) => (
        <DialogTrigger>
          <Wrapper xstyle={xstyle}>
            {typeof children === "function" ? children(state) : children}
          </Wrapper>
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
export const ColorPickerDialog = styledPart(Dialog, "color-picker-dialog", styles.dialog);
