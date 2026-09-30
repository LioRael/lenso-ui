"use client";
// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Field } from "@base-ui/react/field";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { styledPart } from "../../utils/styled.js";
import { FieldScope } from "./field-scope.js";
const Root = styledPart(Field.Root, "text-field", textFieldStyles.root);
export type TextFieldRootProps = React.ComponentProps<typeof Root> & { fullWidth?: boolean };
export function TextFieldRoot({ fullWidth = false, xstyle, ...props }: TextFieldRootProps) {
  return (
    <FieldScope value={true}>
      <Root {...props} xstyle={[fullWidth && textFieldStyles.fullWidth, xstyle]} />
    </FieldScope>
  );
}
export const TextField = Object.assign(TextFieldRoot, { Root: TextFieldRoot });
export type TextFieldProps = TextFieldRootProps;
