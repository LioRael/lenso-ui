"use client";
// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Field } from "@base-ui/react/field";
import { textFieldStyles } from "@lenso/tokens/textfield";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "./field-scope.js";
export type TextFieldRootProps = StyleXProps<Field.Root.Props> & {
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function TextFieldRoot({
  fullWidth = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: TextFieldRootProps) {
  const compiled = stylex.props(
    textFieldStyles.root,
    fullWidth && textFieldStyles.fullWidth,
    xstyle,
  );
  return (
    <FieldScope value={true}>
      <Field.Root
        {...props}
        {...compiled}
        style={mergeStyle<Field.Root.State>(compiled.style, style)}
        data-slot={slot ?? "text-field"}
      />
    </FieldScope>
  );
}
export const TextField = Object.assign(TextFieldRoot, { Root: TextFieldRoot });
export type TextFieldProps = TextFieldRootProps;
