"use client";
// Modified: UI SDK native value/onValueChange contract.
import { RadioGroup as SdkRadioGroup } from "@ui-sdk/react/radio";
import { slotRender } from "../../utils/sdk-render.js";
import { radioGroupStyles } from "@lenso/tokens/radio-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { RadioVariantContext, type RadioVariant } from "../radio/radio.js";

export type RadioGroupRootProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkRadioGroup>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkRadioGroup>["ref"];
  }
> & { "data-lenso-slot"?: unknown; variant?: RadioVariant };
export function RadioGroupRoot({
  variant = "primary",
  xstyle,
  style,
  ...props
}: RadioGroupRootProps) {
  const compiled = stylex.props(radioGroupStyles.root, xstyle);
  return (
    <RadioVariantContext value={variant}>
      <SdkRadioGroup
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("div", props["data-lenso-slot"] ?? "radio-group", props.render)}
      />
    </RadioVariantContext>
  );
}
