// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
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
        <Card.Title>成为 Acme 创作者！</Card.Title>
        <Card.Description>
          前往 Acme 创作者中心立即注册，开始从粉丝与支持者处获得积分奖励。
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          aria-label="前往 Acme 创作者中心（在新标签页打开）"
          href="https://heroui.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          创作者中心
          <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
