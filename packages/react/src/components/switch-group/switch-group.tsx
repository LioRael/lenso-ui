"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: native grouping; each switch retains its own state.
 */
import { switchGroupStyles } from "@lenso/tokens/switch-group";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

type Orientation = "horizontal" | "vertical";
const OrientationContext = createContext<Orientation>("vertical");
export type SwitchGroupRootProps = StyleXProps<React.ComponentPropsWithRef<"div">> & {
  "data-slot"?: unknown;
  orientation?: Orientation;
};
export function SwitchGroupRoot({
  orientation = "vertical",
  children,
  xstyle,
  style,
  ...props
}: SwitchGroupRootProps) {
  const compiled = stylex.props(switchGroupStyles.root, xstyle);
  return (
    <OrientationContext value={orientation}>
      <div
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "switch-group"}
        role={props.role ?? "group"}
      >
        <SwitchGroupItems>{children}</SwitchGroupItems>
      </div>
    </OrientationContext>
  );
}
function Items({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(switchGroupStyles.items, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "switch-group-items"}
    />
  );
}
export type SwitchGroupItemsProps = ComponentPropsWithRef<typeof Items> & {
  orientation?: Orientation;
};
export function SwitchGroupItems({ orientation, xstyle, ...props }: SwitchGroupItemsProps) {
  const inherited = useContext(OrientationContext);
  return <Items {...props} xstyle={[switchGroupStyles[orientation ?? inherited], xstyle]} />;
}
