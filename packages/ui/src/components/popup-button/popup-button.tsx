"use client";

import { NativeButton as SdkButton } from "../../utils/native-button.js";
import { mergeProps } from "@ui-sdk/react/primitive";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type PopupButtonProps = StyleXProps<ComponentPropsWithRef<typeof SdkButton>> & {
  "data-lenso-slot"?: unknown;
};

export function PopupButton({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: PopupButtonProps) {
  const compiled = stylex.props(popupButtonStyles.root, xstyle);
  return (
    <SdkButton
      {...mergeProps(compiled, props)}
      style={mergeStyle<import("@ui-sdk/react/button").ButtonState>(compiled.style, style)}
      data-lenso-slot={slot ?? "popup-button"}
      data-popup-button=""
    >
      {(state) => (
        <>
          {typeof children === "function" ? children(state) : children}
          <span
            aria-hidden="true"
            data-lenso-slot="popup-button-indicator"
            {...stylex.props(popupButtonStyles.indicator)}
          >
            <svg width="14" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="m5 5 3-3 3 3 M5 11l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </>
      )}
    </SdkButton>
  );
}
