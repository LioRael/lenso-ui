// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Button, CloseButton } from "@lenso/ui";
import { useRef, useState } from "react";
export function Default() {
  const [closed, setClosed] = useState(false);
  const needsFocus = useRef(false);
  function focusReplacement(node: HTMLElement | null) {
    if (node && needsFocus.current) {
      needsFocus.current = false;
      node.focus();
    }
  }
  return closed ? (
    <Button
      ref={focusReplacement}
      variant="secondary"
      onClick={() => {
        needsFocus.current = true;
        setClosed(false);
      }}
    >
      Restore example
    </Button>
  ) : (
    <CloseButton
      ref={focusReplacement}
      aria-label="Dismiss example"
      onClick={() => {
        needsFocus.current = true;
        setClosed(true);
      }}
    />
  );
}
