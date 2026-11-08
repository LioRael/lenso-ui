"use client";
import { Input as BaseInput } from "@base-ui/react/input";
import { inputStyles } from "@lenso/tokens/input";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { useContext } from "react";
import { FieldGroupContext } from "../textfield/group-context.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type InputProps = StyleXProps<
  Omit<BaseInput.Props, "ref"> & React.RefAttributes<HTMLElement>
> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** Opt into glass for a field that floats above content. */
  glass?: boolean;
  /** Opt into elastic press/release feedback; native editing owns dragging. */
  elastic?: boolean;
  "data-slot"?: unknown;
};
export function InputRoot({
  variant = "primary",
  fullWidth = false,
  glass = false,
  elastic = false,
  xstyle,
  style,
  "data-slot": slot,
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
    <BaseInput
      {...props}
      {...compiled}
      ref={inputRef}
      style={mergeStyle<BaseInput.State>(compiled.style, style)}
      data-slot={slot ?? "input"}
    />
  );
}
export const Input = Object.assign(InputRoot, { Root: InputRoot });
export type InputRootProps = InputProps;
