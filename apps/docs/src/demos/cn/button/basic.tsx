// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Button } from "@lenso/ui";
import { useState } from "react";
export function Basic() {
  const [presses, setPresses] = useState(0);
  return (
    <Button onClick={() => setPresses((value) => value + 1)}>
      {presses ? `Clicked ${presses} time${presses === 1 ? "" : "s"}` : "点我"}
    </Button>
  );
}
