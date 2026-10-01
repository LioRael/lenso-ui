"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext } from "react";
import { disclosureGroupStyles } from "@lenso/tokens/disclosure-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { navigateDisclosureGroup } from "../accordion/keyboard.js";
export const DisclosureGroupContext = createContext(false);
export type DisclosureGroupRootProps = StyleXProps<
  Omit<BaseAccordion.Root.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Root>["ref"];
  }
> & { "data-slot"?: unknown };
export function DisclosureGroupRoot({
  orientation = "vertical",
  loopFocus = true,
  onKeyDown,
  xstyle,
  style,
  ...props
}: DisclosureGroupRootProps) {
  const compiled = stylex.props(disclosureGroupStyles.root, xstyle);
  return (
    <DisclosureGroupContext value={true}>
      <BaseAccordion.Root
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "disclosure-group"}
        orientation={orientation}
        loopFocus={loopFocus}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          navigateDisclosureGroup(event, orientation, loopFocus);
        }}
      />
    </DisclosureGroupContext>
  );
}
export const DisclosureGroup = Object.assign(DisclosureGroupRoot, { Root: DisclosureGroupRoot });
