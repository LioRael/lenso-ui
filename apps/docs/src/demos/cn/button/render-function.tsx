"use client";

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
      点按
    </Button>
  );
}
