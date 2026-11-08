"use client";
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
          src="/assets/demo/illustrations/landscape.svg"
        />
        <Card.Header>
          <Card.Title>Indie Hackers</Card.Title>
          <Card.Description>148 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="Martha's profile picture" xstyle={s.avatarTiny}>
            <Avatar.Image alt="Martha's avatar" src="/assets/demo/avatars/red.svg" />
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
          src="/assets/demo/illustrations/workspace.svg"
        />
        <Card.Header>
          <Card.Title>AI Builders</Card.Title>
          <Card.Description>362 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={s.row2}>
          <Avatar aria-label="John's profile picture" xstyle={s.avatarTiny}>
            <Avatar.Image alt="John's avatar - blue themed" src="/assets/demo/avatars/blue.svg" />
            <Avatar.Fallback xstyle={s.textXs}>B</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(s.textXs)}>By John</span>
        </Card.Footer>
      </Card>
    </div>
  );
}
