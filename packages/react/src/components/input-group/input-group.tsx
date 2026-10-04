"use client";
// HeroUI v3.2.6, Apache-2.0.
import { Input as BaseInput } from "@base-ui/react/input";
import { inputGroupStyles } from "@lenso/tokens/input-group";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { TextArea } from "../textarea/textarea.js";
export type InputGroupRootProps = StyleXProps<React.ComponentPropsWithRef<"div">> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function InputGroupRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-slot": slot,
  onClick,
  ...props
}: InputGroupRootProps) {
  const compiled = stylex.props(
    inputGroupStyles.root,
    variant === "secondary" && inputGroupStyles.secondary,
    fullWidth && inputGroupStyles.fullWidth,
    xstyle,
  );
  return (
    // The control remains the keyboard entry point; this wrapper only expands its pointer target.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "input-group"}
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
  );
}
export function InputGroupInput({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Omit<BaseInput.Props, "ref"> & React.RefAttributes<HTMLElement>> & {
  "data-slot"?: unknown;
}) {
  const compiled = stylex.props(inputGroupStyles.input, xstyle);
  return (
    <BaseInput
      {...props}
      {...compiled}
      style={mergeStyle<BaseInput.State>(compiled.style, style)}
      data-slot={slot ?? "input-group-input"}
    />
  );
}
export function InputGroupTextArea({ xstyle, ...props }: React.ComponentProps<typeof TextArea>) {
  return (
    <TextArea
      {...props}
      data-slot="input-group-textarea"
      xstyle={[inputGroupStyles.input, xstyle]}
    />
  );
}
export function InputGroupPrefix({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(inputGroupStyles.prefix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "input-group-prefix"}
    />
  );
}
export function InputGroupSuffix({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(inputGroupStyles.suffix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "input-group-suffix"}
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
