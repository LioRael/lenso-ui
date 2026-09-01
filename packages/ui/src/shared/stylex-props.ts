import type * as React from "react";
import type * as stylex from "@stylexjs/stylex";

/**
 * Removes arbitrary class injection from a host module and replaces it with
 * a statically compiled StyleX override. Native inline style remains available
 * for runtime geometry that cannot be known at build time.
 */
export type StyleXProps<Props> = Omit<Props, "className"> & {
  xstyle?: stylex.StyleXStyles;
};

export type StyleXComponentProps<Component extends React.ElementType> = StyleXProps<
  React.ComponentPropsWithRef<Component>
> &
  React.RefAttributes<React.ComponentRef<Component>>;
