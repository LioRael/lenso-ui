"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { Separator as Primitive } from "@base-ui/react/separator";
import { separatorStyles, separatorVariants } from "@lenso/tokens/separator";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart(Primitive, "separator", separatorStyles.root);
export type SeparatorRootProps = StyleXProps<ComponentProps<typeof Primitive>> & {
  variant?: keyof typeof separatorVariants;
};
export function SeparatorRoot({
  orientation = "horizontal",
  variant = "default",
  xstyle,
  ...props
}: SeparatorRootProps) {
  return (
    <Root
      orientation={orientation}
      {...props}
      xstyle={[separatorStyles[orientation], separatorVariants[variant], xstyle]}
    />
  );
}
export const Separator = Object.assign(SeparatorRoot, { Root: SeparatorRoot });
export type SeparatorProps = SeparatorRootProps;
export type Separator = { Props: SeparatorProps; RootProps: SeparatorRootProps };
