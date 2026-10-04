// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function WithAvatar() {
  return (
    <div {...stylex.props(s.wrap4)}>
      <Card xstyle={s.card200}>
        <img
          alt="独立创客社区"
          {...stylex.props(s.imageCommunity)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
        />
        <Card.Header>
          <Card.Title>Indie Hackers</Card.Title>
          <Card.Description>148 位成员</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="玛莎的头像" xstyle={s.avatarTiny}>
            <Avatar.Image
              alt="玛莎的头像"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
            />
            <Avatar.Fallback xstyle={s.textXs}>IH</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(s.textXs)}>创建者：玛莎</span>
        </Card.Footer>
      </Card>
      <Card xstyle={s.card200}>
        <img
          alt="AI 开发者社区"
          {...stylex.props(s.imageCommunity)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo2.jpg"
        />
        <Card.Header>
          <Card.Title>AI Builders</Card.Title>
          <Card.Description>362 位成员</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="约翰的头像" xstyle={s.avatarTiny}>
            <Avatar.Image
              alt="约翰的头像"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
            <Avatar.Fallback xstyle={s.textXs}>B</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(s.textXs)}>创建者：约翰</span>
        </Card.Footer>
      </Card>
    </div>
  );
}
