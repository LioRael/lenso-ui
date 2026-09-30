"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import { Menu as Base } from "@base-ui/react/menu";
import { menuSectionStyles as s } from "@lenso/tokens/menu-section";
import { styledPart } from "../../utils/styled.js";
export const MenuSectionRoot = styledPart(Base.Group, "menu-section", s.root);
export const MenuSectionLabel = styledPart(Base.GroupLabel, "menu-section-label", s.label);
export const MenuSection = Object.assign(MenuSectionRoot, {
  Root: MenuSectionRoot,
  Label: MenuSectionLabel,
});
