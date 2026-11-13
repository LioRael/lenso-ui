"use client";
import { Input as SdkInput, type InputState } from "@ui-sdk/react/input";
import { slotRender } from "../../utils/sdk-render.js";
import { inputStyles } from "@lenso/tokens/input";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { useContext } from "react";
import { FieldGroupContext } from "../textfield/group-context.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type InputProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkInput>, "ref"> & React.RefAttributes<HTMLElement>
> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** Opt into glass for a field that floats above content. */
  glass?: boolean;
  /** Opt into elastic press/release feedback; native editing owns dragging. */
  elastic?: boolean;
  "data-lenso-slot"?: unknown;
};
export function InputRoot({
  variant = "primary",
  fullWidth = false,
  glass = false,
  elastic = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ref,
  ...props
}: InputProps) {
  const grouped = useContext(FieldGroupContext);
  const inputRef = useFocusMethodRef(
    useElasticRef(useGlassRef(ref, glass), { enabled: elastic && !props.disabled }),
  );
  const compiled = stylex.props(
    glass && liquidMaterialStyles.small,
    inputStyles.input,
    glass && inputStyles.fieldGlass,
    elastic && inputStyles.elastic,
    !glass && variant === "secondary" && inputStyles.secondary,
    fullWidth && inputStyles.fullWidth,
    grouped && !glass && inputStyles.formGrouped,
    xstyle,
  );
  return (
    <SdkInput
      {...props}
      {...compiled}
      ref={inputRef}
      style={mergeStyle<InputState>(compiled.style, style)}
      render={slotRender("input", slot ?? "input", props.render)}
    />
  );
}
export const Input = Object.assign(InputRoot, { Root: InputRoot });
export type InputRootProps = InputProps;
