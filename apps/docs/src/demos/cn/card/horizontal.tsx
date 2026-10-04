// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Card, CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Horizontal() {
  return (
    <Card xstyle={s.horizontal}>
      <div {...stylex.props(s.imageFrame)}>
        <img
          alt="樱桃"
          {...stylex.props(s.imageZoom)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/cherries.jpeg"
        />
      </div>
      <div {...stylex.props(s.flexContent)}>
        <Card.Header xstyle={s.gap1}>
          <Card.Title xstyle={s.titleInset}>成为 ACME 创作者！</Card.Title>
          <Card.Description>
            这是一段占位说明文字，用于展示横向卡片布局、配图与右上角关闭按钮的排版效果。
          </Card.Description>
          <CloseButton aria-label="关闭横幅" xstyle={s.close} />
        </Card.Header>
        <Card.Footer xstyle={s.footer}>
          <div {...stylex.props(s.column)}>
            <span {...stylex.props(s.textSm, s.medium, s.foreground)}>仅剩 10 个名额</span>
            <span {...stylex.props(s.textXs, s.muted)}>报名截止：10 月 10 日</span>
          </div>
          <Button xstyle={s.fullAuto}>立即申请</Button>
        </Card.Footer>
      </div>
    </Card>
  );
}
