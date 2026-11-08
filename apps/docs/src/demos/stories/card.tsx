"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface CardStoryProps extends Pick<StoryComponentProps<typeof Card>, "variant"> {
  title: string;
  description: string;
}
export const initialArgs: CardStoryProps = /* story-args:start */ {
  title: "Become an Acme Creator!",
  description: "Visit the Creator Hub to share your work.",
  variant: "default",
}; /* story-args:end */

// oxlint-disable jsx-a11y/prefer-tag-over-role -- A named SVG needs img semantics; an HTML img cannot render this icon.
import { CircleDollar } from "@gravity-ui/icons";
import { Card, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function Default(overrides: CardStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { title, description, ...props } = args;
  return (
    <Card xstyle={s.card400} {...props}>
      <CircleDollar
        aria-label="Dollar sign icon"
        role="img"
        {...stylex.props(s.primary, s.icon6)}
      />
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          aria-label="Go to Acme Creator Hub (opens in new tab)"
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Creator Hub <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
