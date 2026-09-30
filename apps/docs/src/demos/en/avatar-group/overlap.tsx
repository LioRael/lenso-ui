"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import type { ReactNode } from "react";
import { Avatar, AvatarGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const stripes = stylex.keyframes({ to: { backgroundPosition: "24px 24px" } });
const styles = stylex.create({
  frame: { position: "relative", display: "inline-flex", borderRadius: 12, padding: 24 },
  stripes: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    backgroundColor: "color-mix(in oklab, var(--danger) 6%, var(--surface))",
    backgroundImage:
      "repeating-linear-gradient(-45deg, transparent 0 10px, color-mix(in oklab, var(--danger) 12%, transparent) 10px 11px, transparent 11px 21px, color-mix(in oklab, var(--danger) 28%, transparent) 21px 22px)",
    backgroundSize: "24px 24px",
    animationName: stripes,
    animationDuration: "2.8s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});

function StripeBackdrop({ children }: { children: ReactNode }) {
  return (
    <div {...stylex.props(styles.frame)}>
      <div aria-hidden {...stylex.props(styles.stripes)} />
      <div {...stylex.props(s.relativeForeground)}>{children}</div>
    </div>
  );
}
function DemoGroup({ overlap }: { overlap: "clip" | "ring" }) {
  return (
    <AvatarGroup overlap={overlap} size="lg">
      <Avatar>
        <Avatar.Image
          alt="John"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image
          alt="Emily"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg"
        />
        <Avatar.Fallback>EC</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar>
      <AvatarGroup.Count>+2</AvatarGroup.Count>
    </AvatarGroup>
  );
}
export function Overlap() {
  return (
    <div {...stylex.props(s.startColumn6)}>
      <div {...stylex.props(s.column2)}>
        <p {...stylex.props(s.textSm, s.muted)}>clip</p>
        <StripeBackdrop>
          <DemoGroup overlap="clip" />
        </StripeBackdrop>
      </div>
      <div {...stylex.props(s.column2)}>
        <p {...stylex.props(s.textSm, s.muted)}>ring</p>
        <StripeBackdrop>
          <DemoGroup overlap="ring" />
        </StripeBackdrop>
      </div>
    </div>
  );
}
