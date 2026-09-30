"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button } from "@lenso/ui";
import { useState } from "react";
export function RenderFunction() {
  const [pressed, setPressed] = useState(false);
  return (
    <Button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") setPressed(true);
      }}
      onKeyUp={() => setPressed(false)}
      onBlur={() => setPressed(false)}
      render={(props) => <button {...props} data-custom={pressed ? "pressed" : "bar"} />}
    >
      Press me
    </Button>
  );
}
