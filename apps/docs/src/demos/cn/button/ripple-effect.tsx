"use client";

import { Button } from "@lenso/ui";
import { Ripple } from "m3-ripple";
import "m3-ripple/ripple.css";
export function RippleEffect() {
  return (
    <Button variant="bordered">
      <Ripple />
      点我
    </Button>
  );
}
