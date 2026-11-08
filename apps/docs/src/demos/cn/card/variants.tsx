"use client";

import { Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const cards = [
  {
    variant: "glass",
    title: "玻璃",
    description: "Medium Liquid Glass 面板材料",
    content: "通过 variant=glass 选择可透出背景的表面。",
  },
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
