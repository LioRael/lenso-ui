"use client";

import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Copy, Check } from "@gravity-ui/icons";
import { Button } from "@lenso/ui/button";
import { styles, notebook } from "@lenso/docs/presentation";
import { useDocumentationMessages } from "./i18n";

export function DocumentationCodeBlock({
  code,
  children,
}: {
  code: string;
  children: ReactNode;
}): ReactNode {
  const [status, setStatus] = useState("");
  const { code: messages } = useDocumentationMessages();
  return (
    <div {...stylex.props(notebook.codePane)}>
      <Button
        aria-label={messages.copy}
        isIconOnly
        variant="borderless"
        xstyle={[notebook.iconButton, notebook.codeCopy]}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setStatus(messages.copied);
          } catch {
            setStatus(messages.clipboardError);
          }
        }}
      >
        {status === messages.copied ? (
          <Check width={16} height={16} aria-hidden="true" />
        ) : (
          <Copy width={16} height={16} aria-hidden="true" />
        )}
      </Button>
      <output aria-live="polite" {...stylex.props(notebook.hidden)}>
        {status}
      </output>
      {/* A focusable pre owns horizontal keyboard scrolling, including Safari. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre dir="ltr" tabIndex={0} aria-label={messages.source} {...stylex.props(styles.pre)}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
