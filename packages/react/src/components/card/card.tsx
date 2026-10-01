"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { cardStyles, cardVariants } from "@lenso/tokens/card";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export type CardRootProps = StyleXProps<ComponentProps<"div">> & {
  variant?: keyof typeof cardVariants;
};
export function CardRoot({ variant = "default", xstyle, style, ...props }: CardRootProps) {
  const compiled = stylex.props(cardStyles.root, cardVariants[variant], xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function CardHeader({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(cardStyles.header, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card-header"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function CardTitle({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<ComponentProps<"h3">>) {
  const compiled = stylex.props(cardStyles.title, xstyle);
  return (
    <h3
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card-title"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {children}
    </h3>
  );
}
export function CardDescription({ xstyle, style, ...props }: StyleXProps<ComponentProps<"p">>) {
  const compiled = stylex.props(cardStyles.description, xstyle);
  return (
    <p
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card-description"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function CardContent({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(cardStyles.content, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card-content"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function CardFooter({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(cardStyles.footer, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "card-footer"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
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
