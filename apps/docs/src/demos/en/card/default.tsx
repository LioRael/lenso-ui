"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
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
        <Card.Title>Become an Acme Creator!</Card.Title>
        <Card.Description>
          Visit the Acme Creator Hub to sign up today and start earning credits from your fans and
          followers.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          aria-label="Go to Acme Creator Hub (opens in new tab)"
          href="https://heroui.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Creator Hub <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
