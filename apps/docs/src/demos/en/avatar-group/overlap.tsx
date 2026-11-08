"use client";
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
    backgroundColor:
      "color-mix(in oklab, var(--lenso-status-error-indicator) 6%, var(--lenso-background-grouped-secondary))",
    backgroundImage:
      "repeating-linear-gradient(-45deg, transparent 0 10px, color-mix(in oklab, var(--lenso-status-error-indicator) 12%, transparent) 10px 11px, transparent 11px 21px, color-mix(in oklab, var(--lenso-status-error-indicator) 28%, transparent) 21px 22px)",
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
        <Avatar.Image alt="John" src="/assets/demo/avatars/blue.svg" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image alt="Emily" src="/assets/demo/avatars/purple.svg" />
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
