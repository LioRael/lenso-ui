"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

export function WithAvatar() {
  return (
    <div {...stylex.props(s.wrap4)}>
      <Card xstyle={s.card200}>
        <img
          alt="Indie Hackers community"
          {...stylex.props(s.imageCommunity)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
        />
        <Card.Header>
          <Card.Title>Indie Hackers</Card.Title>
          <Card.Description>148 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="Martha's profile picture" xstyle={s.avatarTiny}>
            <Avatar.Image
              alt="Martha's avatar"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
            />
            <Avatar.Fallback xstyle={s.textXs}>IH</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(s.textXs)}>By Martha</span>
        </Card.Footer>
      </Card>
      <Card xstyle={s.card200}>
        <img
          alt="AI Builders community"
          {...stylex.props(s.imageCommunity)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo2.jpg"
        />
        <Card.Header>
          <Card.Title>AI Builders</Card.Title>
          <Card.Description>362 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="John's profile picture" xstyle={s.avatarTiny}>
            <Avatar.Image
              alt="John's avatar - blue themed"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
            <Avatar.Fallback xstyle={s.textXs}>B</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(s.textXs)}>By John</span>
        </Card.Footer>
      </Card>
    </div>
  );
}
