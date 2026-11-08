"use client";
import { Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

const cards = [
  {
    variant: "glass",
    title: "Glass",
    description: "Medium Liquid Glass panel",
    content: "Use variant=glass for a surface that reveals its backdrop.",
  },
  {
    variant: "transparent",
    title: "Transparent",
    description: "Minimal prominence with transparent background",
    content: "Use for less important content or nested cards",
  },
  {
    variant: "default",
    title: "Default",
    description: "Standard card appearance (bg-surface)",
    content: "The default card variant for most use cases",
  },
  {
    variant: "secondary",
    title: "Secondary",
    description: "Medium prominence (bg-surface-secondary)",
    content: "Use to draw moderate attention",
  },
  {
    variant: "tertiary",
    title: "Tertiary",
    description: "Higher prominence (bg-surface-tertiary)",
    content: "Use for primary or featured content",
  },
] as const;
export function Variants() {
  return (
    <div {...stylex.props(s.column4)}>
      {cards.map((card) => (
        <div key={card.variant} {...stylex.props(card.variant === "glass" && s.glassScene)}>
          {card.variant === "glass" && (
            <div data-lenso-backdrop aria-hidden="true" {...stylex.props(s.glassBackdrop)} />
          )}
          <Card
            xstyle={[s.card320, card.variant === "glass" && s.glassCard]}
            variant={card.variant}
          >
            <Card.Header>
              <Card.Title>{card.title}</Card.Title>
              <Card.Description>{card.description}</Card.Description>
            </Card.Header>
            <Card.Content>
              <p>{card.content}</p>
            </Card.Content>
          </Card>
        </div>
      ))}
    </div>
  );
}
