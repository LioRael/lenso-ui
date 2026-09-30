"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext, type ComponentProps } from "react";
import { disclosureGroupStyles } from "@lenso/tokens/disclosure-group";
import { styledPart } from "../../utils/styled.js";
import { navigateDisclosureGroup } from "../accordion/keyboard.js";
export const DisclosureGroupContext = createContext(false);
const Root = styledPart(BaseAccordion.Root, "disclosure-group", disclosureGroupStyles.root);
export type DisclosureGroupRootProps = ComponentProps<typeof Root>;
export function DisclosureGroupRoot({
  orientation = "vertical",
  loopFocus = true,
  onKeyDown,
  ...props
}: DisclosureGroupRootProps) {
  return (
    <DisclosureGroupContext value={true}>
      <Root
        {...props}
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
