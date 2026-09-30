// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Bold, Copy, Italic, Underline } from "@gravity-ui/icons";
import { Toolbar } from "@lenso/ui";
import { useState } from "react";
export function Basic() {
  const [status, setStatus] = useState("");
  return (
    <div>
      <Toolbar aria-label="文本格式">
        <Toolbar.Group aria-label="Formatting controls">
          <Toolbar.Button isIconOnly aria-label="粗体" onClick={() => setStatus("Bold selected")}>
            <Bold aria-hidden="true" />
          </Toolbar.Button>
          <Toolbar.Button isIconOnly aria-label="斜体" onClick={() => setStatus("Italic selected")}>
            <Italic aria-hidden="true" />
          </Toolbar.Button>
          <Toolbar.Button
            isIconOnly
            aria-label="下划线"
            onClick={() => setStatus("Underline selected")}
          >
            <Underline aria-hidden="true" />
          </Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Button
          isIconOnly
          aria-label="Copy example text"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText("Example text");
              setStatus("Example text copied");
            } catch {
              setStatus("The browser did not allow clipboard access");
            }
          }}
        >
          <Copy aria-hidden="true" />
        </Toolbar.Button>
      </Toolbar>
      {status && <output>{status}</output>}
    </div>
  );
}
