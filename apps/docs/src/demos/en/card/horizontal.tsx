"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Card, CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

export function Horizontal() {
  return (
    <Card xstyle={s.horizontal}>
      <div {...stylex.props(s.imageFrame)}>
        <img
          alt="Cherries"
          {...stylex.props(s.imageZoom)}
          loading="lazy"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/cherries.jpeg"
        />
      </div>
      <div {...stylex.props(s.flexContent)}>
        <Card.Header xstyle={s.gap1}>
          <Card.Title xstyle={s.titleInset}>Become an ACME Creator!</Card.Title>
          <Card.Description>
            Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor sed amet
            faucibus etiam.
          </Card.Description>
          <CloseButton aria-label="Close banner" xstyle={s.close} />
        </Card.Header>
        <Card.Footer xstyle={s.footer}>
          <div {...stylex.props(s.column)}>
            <span {...stylex.props(s.textSm, s.medium, s.foreground)}>Only 10 spots</span>
            <span {...stylex.props(s.textXs, s.muted)}>Submission ends Oct 10.</span>
          </div>
          <Button xstyle={s.fullAuto}>Apply Now</Button>
        </Card.Footer>
      </div>
    </Card>
  );
}
