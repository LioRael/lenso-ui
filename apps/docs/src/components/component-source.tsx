"use client";
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The sole focusable pre supports keyboard scrolling, including Safari.

import { useState, type ReactNode } from "react";
import { Check, Copy } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles, notebook, codeStyles } from "@lenso/docs/presentation";
import { LiveSource } from "./live-source";

// Local examples show their own source rather than a substitute.
export function ComponentSource({
  code,
  local,
  highlighted,
  files,
  standalone = false,
  live = false,
  active: visible = true,
  locale = "en",
}: {
  code: string;
  local: boolean;
  highlighted?: ReactNode;
  files?: { name: string; code: string; highlighted?: ReactNode }[] | undefined;
  standalone?: boolean;
  live?: boolean;
  active?: boolean;
  locale?: "en" | "cn";
}) {
  const cn = locale === "cn";
  const copyLabel = local
    ? cn
      ? "复制本地示例源码"
      : "Copy local example source"
    : "Copy preserved source";
  const copiedLabel = cn ? "源码已复制" : "Source copied";
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
        variant="borderless"
        aria-label={copyLabel}
        xstyle={[notebook.iconButton, notebook.codeCopy]}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(raw);
            setStatus(copiedLabel);
          } catch {
            setStatus(
              cn
                ? "无法访问剪贴板，请选择代码复制。"
                : "Clipboard unavailable. Select the code to copy it.",
            );
          }
        }}
      >
        {status === copiedLabel ? (
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
        {...stylex.props(
          styles.pre,
          !standalone && notebook.previewPre,
          standalone && sourceStyles.standalone,
        )}
      >
        <code>
          {live ? (
            <LiveSource code={raw} file={active?.name} active={visible} />
          ) : (
            (active?.highlighted ??
            highlighted ??
            raw.split("\n").map((line, index) => (
              <span key={index} {...stylex.props(notebook.codeLine)}>
                <span aria-hidden="true" {...stylex.props(notebook.lineNumber)}>
                  {index + 1}
                </span>
                {line || " "}
              </span>
            )))
          )}
        </code>
      </pre>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </div>
  );
}

const sourceStyles = stylex.create({
  standalone: {
    marginBlock: 0,
    maxHeight: "min(420px, 60dvh)",
    overflow: "auto",
    ":focus-visible": { outline: "1.5px solid var(--lenso-focus-ring)", outlineOffset: 3 },
  },
});
