"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { cardStyles, cardVariants } from "@lenso/tokens/card";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import type { ComponentProps } from "react";
const Root = styledPart("div", "card", cardStyles.root);
export type CardRootProps = StyleXProps<ComponentProps<"div">> & {
  variant?: keyof typeof cardVariants;
};
export function CardRoot({ variant = "default", xstyle, ...props }: CardRootProps) {
  return <Root {...props} xstyle={[cardVariants[variant], xstyle]} />;
}
export const CardHeader = styledPart("div", "card-header", cardStyles.header);
export const CardTitle = styledPart("h3", "card-title", cardStyles.title);
export const CardDescription = styledPart("p", "card-description", cardStyles.description);
export const CardContent = styledPart("div", "card-content", cardStyles.content);
export const CardFooter = styledPart("div", "card-footer", cardStyles.footer);
export const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
export type CardProps = CardRootProps;
export type CardHeaderProps = ComponentProps<typeof CardHeader>;
export type CardTitleProps = ComponentProps<typeof CardTitle>;
export type CardDescriptionProps = ComponentProps<typeof CardDescription>;
export type CardContentProps = ComponentProps<typeof CardContent>;
export type CardFooterProps = ComponentProps<typeof CardFooter>;
export type Card = {
  Props: CardProps;
  RootProps: CardRootProps;
  HeaderProps: CardHeaderProps;
  TitleProps: CardTitleProps;
  DescriptionProps: CardDescriptionProps;
  ContentProps: CardContentProps;
  FooterProps: CardFooterProps;
};
