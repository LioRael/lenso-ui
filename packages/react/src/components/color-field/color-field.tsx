"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX and local RAC support parts.
 */
import { use, type ComponentPropsWithRef } from "react";
import { ColorField as Primitive, ColorFieldStateContext } from "react-aria-components/ColorField";
import { Label } from "react-aria-components/Label";
import { Text } from "react-aria-components/Text";
import { FieldError } from "react-aria-components/FieldError";
import { colorFieldStyles as styles } from "@lenso/tokens/color-field";
import { styledPart, type StyleXProps } from "../../utils/styled.js";

export type ColorFieldRootProps = StyleXProps<ComponentPropsWithRef<typeof Primitive>> & {
  fullWidth?: boolean;
};
const Root = styledPart(Primitive, "color-field", styles.root);
export function ColorFieldRoot({ fullWidth, xstyle, ...props }: ColorFieldRootProps) {
  return <Root {...props} xstyle={[fullWidth && styles.fullWidth, xstyle]} />;
}
export const ColorFieldLabel = styledPart(Label, "label", styles.label);
const Description = styledPart(Text, "description", styles.description);
export function ColorFieldDescription({
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Text>>) {
  const state = use(ColorFieldStateContext);
  return (
    <Description
      slot="description"
      {...props}
      xstyle={[state?.displayValidation.isInvalid && styles.hidden, xstyle]}
    />
  );
}
export const ColorFieldError = styledPart(FieldError, "field-error", styles.error);
export type { Color as ColorValue } from "react-aria-components/ColorArea";
