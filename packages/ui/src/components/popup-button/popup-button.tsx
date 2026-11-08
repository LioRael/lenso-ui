"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type PopupButtonProps = StyleXProps<ComponentPropsWithRef<typeof BaseButton>> & {
  "data-slot"?: unknown;
};

export function PopupButton({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: PopupButtonProps) {
  const compiled = stylex.props(popupButtonStyles.root, xstyle);
  return (
    <BaseButton
      {...mergeProps(compiled, props)}
      style={mergeStyle<BaseButton.State>(compiled.style, style)}
      data-slot={slot ?? "popup-button"}
      data-popup-button=""
    >
      {children}
      <span
        aria-hidden="true"
        data-slot="popup-button-indicator"
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
    </BaseButton>
  );
}
