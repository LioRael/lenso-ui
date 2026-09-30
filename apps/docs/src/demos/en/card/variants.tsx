"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

const cards = [
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
        <Card key={card.variant} xstyle={s.card320} variant={card.variant}>
          <Card.Header>
            <Card.Title>{card.title}</Card.Title>
            <Card.Description>{card.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>{card.content}</p>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
