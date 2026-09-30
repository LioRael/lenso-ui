"use client";
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The sole focusable pre supports keyboard scrolling, including Safari.

import { useState, type ReactNode } from "react";
import { Check, Copy } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import { codeStyles } from "@/styles/code.stylex";

// HeroUI's vertically stacked source pane; local source is never substituted with upstream TSX.
export function ComponentSource({
  code,
  local,
  highlighted,
  files,
  standalone = false,
}: {
  code: string;
  local: boolean;
  highlighted?: ReactNode;
  files?: { name: string; code: string; highlighted: ReactNode }[] | undefined;
  standalone?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(0);
  const active = files?.[selected];
  const raw = active?.code ?? code;
  return (
    <div {...stylex.props(!standalone && notebook.previewCode, notebook.codePane)}>
      {files && files.length > 1 && (
        <div aria-label="Example source files" {...stylex.props(codeStyles.fileList)}>
          {files.map((file, index) => (
            <button
              key={file.name}
              type="button"
              aria-pressed={selected === index}
              {...stylex.props(codeStyles.file)}
              onClick={() => {
                setSelected(index);
                setStatus("");
              }}
            >
              {file.name}
            </button>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        aria-label={local ? "Copy local example source" : "Copy preserved source"}
        xstyle={[notebook.iconButton, notebook.codeCopy]}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(raw);
            setStatus("Source copied");
          } catch {
            setStatus("Clipboard unavailable. Select the code to copy it.");
          }
        }}
      >
        {status === "Source copied" ? (
          <Check width={16} height={16} aria-hidden="true" />
        ) : (
          <Copy width={16} height={16} aria-hidden="true" />
        )}
      </Button>
      <pre
        tabIndex={0}
        dir="ltr"
        aria-label={
          active?.name ?? (local ? "Local adaptation source" : "Preserved upstream source")
        }
        {...stylex.props(styles.pre, !standalone && notebook.previewPre)}
      >
        <code>
          {active?.highlighted ??
            highlighted ??
            raw.split("\n").map((line, index) => (
              <span key={index} {...stylex.props(notebook.codeLine)}>
                <span aria-hidden="true" {...stylex.props(notebook.lineNumber)}>
                  {index + 1}
                </span>
                {line || " "}
              </span>
            ))}
        </code>
      </pre>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </div>
  );
}
