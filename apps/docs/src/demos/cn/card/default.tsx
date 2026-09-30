// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { CircleDollar } from "@gravity-ui/icons";
import { Card, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function Default() {
  return (
    <Card xstyle={demoStyles.card}>
      <CircleDollar aria-hidden="true" {...stylex.props(demoStyles.icon)} />
      <Card.Header>
        <Card.Title>成为 Acme 创作者！</Card.Title>
        <Card.Description>
          前往 Acme 创作者中心立即注册，开始从粉丝与支持者处获得积分奖励。
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          aria-label="Visit the upstream example destination (opens in new tab)"
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
