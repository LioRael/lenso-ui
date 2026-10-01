"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { Separator as Primitive } from "@base-ui/react/separator";
import { separatorStyles, separatorVariants } from "@lenso/tokens/separator";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type SeparatorRootProps = StyleXProps<Primitive.Props> & {
  variant?: keyof typeof separatorVariants;
};
export function SeparatorRoot({
  orientation = "horizontal",
  variant = "default",
  xstyle,
  style,
  ...props
}: SeparatorRootProps) {
  const compiled = stylex.props(
    separatorStyles.root,
    separatorStyles[orientation],
    separatorVariants[variant],
    xstyle,
  );
  return (
    <Primitive
      orientation={orientation}
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "separator"}
      {...compiled}
      style={mergeStyle<Primitive.State>(compiled.style, style)}
    />
  );
}
export const Separator = Object.assign(SeparatorRoot, { Root: SeparatorRoot });
export type SeparatorProps = SeparatorRootProps;
export type Separator = { Props: SeparatorProps; RootProps: SeparatorRootProps };
