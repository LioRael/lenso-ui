import { cardStyles, cardVariants } from "@lenso/tokens/card";
import { materialStyles } from "@lenso/tokens/materials";
import { htmlPart } from "./parts.js";

export const CardRoot = htmlPart<"div", { variant?: keyof typeof cardVariants }>(
  "div",
  "card",
  (props) => [
    props.variant === "glass" && materialStyles.root,
    cardStyles.root,
    cardVariants[props.variant ?? "default"],
    props.variant === "glass" && materialStyles.accessible,
  ],
  "variant",
);
export const CardHeader = htmlPart("div", "card-header", () => cardStyles.header);
export const CardTitle = htmlPart("h3", "card-title", () => cardStyles.title);
export const CardDescription = htmlPart("p", "card-description", () => cardStyles.description);
export const CardContent = htmlPart("div", "card-content", () => cardStyles.content);
export const CardFooter = htmlPart("div", "card-footer", () => cardStyles.footer);

export const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
