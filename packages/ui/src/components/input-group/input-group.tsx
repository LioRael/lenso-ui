"use client";
import { Input as SdkInput } from "@ui-sdk/react/input";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { inputStyles } from "@lenso/tokens/input";
import { textAreaStyles } from "@lenso/tokens/textarea";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import { TextArea } from "../textarea/textarea.js";
import { Input } from "../input/input.js";
import { FieldGroupContext } from "../textfield/group-context.js";
import { useContext } from "react";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
export type InputGroupRootProps = StyleXProps<React.ComponentPropsWithRef<"div">> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** Use a glass shell for an input that floats above content. */
  glass?: boolean;
  /** Enable press/release feedback on the whole input shell. */
  elastic?: boolean;
  "data-lenso-slot"?: unknown;
};
export function InputGroupRoot({
  variant = "primary",
  fullWidth = false,
  glass = false,
  elastic = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
  onClick,
  onPointerDown,
  ref,
  ...props
}: InputGroupRootProps) {
  const grouped = useContext(FieldGroupContext);
  const glassRef = useFocusMethodRef(useElasticRef(useGlassRef(ref, glass), { enabled: elastic }));
  const compiled = stylex.props(
    glass && liquidMaterialStyles.small,
    inputStyles.input,
    inputStyles.group,
    glass && inputStyles.glass,
    glass && inputStyles.glassGroup,
    elastic && inputStyles.elastic,
    !glass && variant === "secondary" && inputStyles.secondary,
    fullWidth && inputStyles.fullWidth,
    grouped && !glass && inputStyles.formGrouped,
    xstyle,
  );
  return (
    <FieldGroupContext.Provider value={false}>
      {/* The control remains the keyboard entry point; the wrapper expands its pointer target. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        {...props}
        {...compiled}
        ref={glassRef}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (
            !event.defaultPrevented &&
            event.target instanceof Element &&
            !event.target.closest("input, textarea, button, a[href], [tabindex], [contenteditable]")
          )
            event.currentTarget
              .querySelector<HTMLInputElement | HTMLTextAreaElement>(
                "input:not(:disabled), textarea:not(:disabled)",
              )
              ?.focus();
        }}
        style={{ ...compiled.style, ...style }}
        data-lenso-slot={slot ?? "input-group"}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || !(event.target instanceof Element)) return;

          const interactive = event.target.closest(
            "input, textarea, select, button, a[href], area[href], summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable='false']), [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='combobox'], [role='textbox'], [role='slider'], [role='spinbutton'], [role='menuitem'], [role='option']",
          );
          if (
            interactive &&
            interactive !== event.currentTarget &&
            event.currentTarget.contains(interactive)
          ) {
            return;
          }

          event.currentTarget
            .querySelector<HTMLInputElement | HTMLTextAreaElement>(
              "input:not(:disabled):not([type='hidden']), textarea:not(:disabled)",
            )
            ?.focus();
        }}
      />
    </FieldGroupContext.Provider>
  );
}
export function InputGroupInput({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkInput>, "ref"> & React.RefAttributes<HTMLElement>
> & {
  "data-lenso-slot"?: unknown;
}) {
  return (
    <Input
      {...props}
      xstyle={[inputStyles.groupedControl, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "input-group-input"}
    />
  );
}
export function InputGroupTextArea({
  xstyle,
  ...props
}: Omit<React.ComponentProps<typeof TextArea>, "glass" | "elastic">) {
  return (
    <TextArea
      {...props}
      glass={false}
      elastic={false}
      data-lenso-slot="input-group-textarea"
      xstyle={[
        inputStyles.groupedControl,
        inputStyles.groupedTextArea,
        props.rows === 1 && textAreaStyles.singleLine,
        xstyle,
      ]}
    />
  );
}
export function InputGroupPrefix({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(inputGroupMaterialStyles.adornment, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "input-group-prefix"}
    />
  );
}
export function InputGroupSuffix({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(inputGroupMaterialStyles.adornment, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "input-group-suffix"}
    />
  );
}
export const InputGroup = Object.assign(InputGroupRoot, {
  Root: InputGroupRoot,
  Input: InputGroupInput,
  TextArea: InputGroupTextArea,
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});
export type InputGroupProps = React.ComponentProps<typeof InputGroupRoot>;
export type InputGroupInputProps = React.ComponentProps<typeof InputGroupInput>;
export type InputGroupTextAreaProps = React.ComponentProps<typeof InputGroupTextArea>;
export type InputGroupPrefixProps = React.ComponentProps<typeof InputGroupPrefix>;
export type InputGroupSuffixProps = React.ComponentProps<typeof InputGroupSuffix>;
