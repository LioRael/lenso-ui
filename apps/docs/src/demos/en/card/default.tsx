"use client";
// oxlint-disable jsx-a11y/prefer-tag-over-role -- A named SVG needs img semantics; an HTML img cannot render this icon.
import { CircleDollar } from "@gravity-ui/icons";
import { Card, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

export function Default() {
  return (
    <Card xstyle={s.card400}>
      <CircleDollar
        aria-label="Dollar sign icon"
        role="img"
        {...stylex.props(s.primary, s.icon6)}
      />
      <Card.Header>
        <Card.Title>Explore Lenso UI</Card.Title>
        <Card.Description>
          Browse the guides to learn how to compose components and themes.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link aria-label="Open the Lenso UI guide" href="/en/docs/react/getting-started">
          Read the guide <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
