"use client";

import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Copy, Check } from "@gravity-ui/icons";
import { Button } from "@base-ui/react/button";
import { styles, notebook } from "../dist/presentation.js";

export function DocumentationCodeBlock({
  code,
  children,
}: {
  code: string;
  children: ReactNode;
}): ReactNode {
  const [status, setStatus] = useState("");
  return (
    <div {...stylex.props(notebook.codePane)}>
      <Button
        aria-label="Copy code"
        {...stylex.props(notebook.iconButton, notebook.codeCopy)}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setStatus("Code copied");
          } catch {
            setStatus("Clipboard unavailable. Select the code to copy it.");
          }
        }}
      >
        {status === "Code copied" ? (
          <Check width={16} height={16} aria-hidden="true" />
        ) : (
          <Copy width={16} height={16} aria-hidden="true" />
        )}
      </Button>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
      {/* A focusable pre owns horizontal keyboard scrolling, including Safari. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre dir="ltr" tabIndex={0} aria-label="Example source" {...stylex.props(styles.pre)}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
