// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const cards = [
  {
    variant: "transparent",
    title: "透明",
    description: "背景透明，视觉层级较低（transparent）",
    content: "适合次要内容或嵌套在其它容器中的卡片",
  },
  {
    variant: "default",
    title: "默认",
    description: "标准外观（bg-surface）",
    content: "大多数场景的默认卡片变体",
  },
  {
    variant: "secondary",
    title: "次要",
    description: "中等强调（bg-surface-secondary）",
    content: "用于需要适度吸引注意力的内容",
  },
  {
    variant: "tertiary",
    title: "第三",
    description: "更高强调（bg-surface-tertiary）",
    content: "适合主要内容或需要突出的展示位",
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
