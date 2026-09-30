"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { headerStyles } from "@lenso/tokens/header";
import { styledPart } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export const HeaderRoot = styledPart("header", "header", headerStyles.root);
export const Header = HeaderRoot;
export type HeaderRootProps = ComponentProps<typeof HeaderRoot>;
export type HeaderProps = HeaderRootProps;
export type Header = { Props: HeaderProps };
