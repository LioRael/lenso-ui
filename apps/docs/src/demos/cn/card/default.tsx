"use client";

// oxlint-disable jsx-a11y/prefer-tag-over-role -- A named SVG needs img semantics; an HTML img cannot render this icon.
import { CircleDollar } from "@gravity-ui/icons";
import { Card, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Default() {
  return (
    <Card xstyle={s.card400}>
      <CircleDollar aria-label="美元图标" role="img" {...stylex.props(s.primary, s.icon6)} />
      <Card.Header>
        <Card.Title>了解 Lenso UI</Card.Title>
        <Card.Description>阅读指南，了解如何组合组件和主题。</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link aria-label="打开 Lenso UI 指南" href="/cn/docs/react/getting-started">
          阅读指南
          <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
