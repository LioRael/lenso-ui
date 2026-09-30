"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button } from "@lenso/ui";
import { Ripple } from "m3-ripple";
import "m3-ripple/ripple.css";
export function RippleEffect() {
  return (
    <Button variant="secondary">
      <Ripple />
      Click me
    </Button>
  );
}
