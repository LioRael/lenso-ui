"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: native grouping; each switch retains its own state.
 */
import { switchGroupStyles } from "@lenso/tokens/switch-group";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";

type Orientation = "horizontal" | "vertical";
const OrientationContext = createContext<Orientation>("vertical");
const Root = styledPart("div", "switch-group", switchGroupStyles.root);
export type SwitchGroupRootProps = ComponentPropsWithRef<typeof Root> & {
  orientation?: Orientation;
};
export function SwitchGroupRoot({
  orientation = "vertical",
  children,
  ...props
}: SwitchGroupRootProps) {
  return (
    <OrientationContext value={orientation}>
      <Root {...props} role={props.role ?? "group"}>
        <SwitchGroupItems>{children}</SwitchGroupItems>
      </Root>
    </OrientationContext>
  );
}
const Items = styledPart("div", "switch-group-items", switchGroupStyles.items);
export type SwitchGroupItemsProps = ComponentPropsWithRef<typeof Items> & {
  orientation?: Orientation;
};
export function SwitchGroupItems({ orientation, xstyle, ...props }: SwitchGroupItemsProps) {
  const inherited = useContext(OrientationContext);
  return <Items {...props} xstyle={[switchGroupStyles[orientation ?? inherited], xstyle]} />;
}
