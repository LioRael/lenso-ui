"use client";

import { useEffect, useRef, useState } from "react";
import type { codeToTokens } from "@pierre/highlights";
type SourceTokens = ReturnType<typeof codeToTokens>["tokens"];
import * as stylex from "@stylexjs/stylex";
import { notebook, codeStyles } from "@lenso/docs/presentation";

let highlighter: Promise<typeof import("@pierre/highlights")> | undefined;
let themes:
  | Promise<{
      light: typeof import("@pierre/highlights/themes/github-light").default;
      dark: typeof import("@pierre/highlights/themes/github-dark").default;
    }>
  | undefined;

export function LiveSource({
  code,
  file,
  active,
}: {
  code: string;
  file?: string;
  active: boolean;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [highlighted, setHighlighted] = useState<{
    code: string;
    file: string | undefined;
    lines: SourceTokens;
  }>();
  useEffect(() => {
    if (!active || near || !root.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [active, near]);
  useEffect(() => {
    if (!active || !near) return;
    let current = true;
    highlighter ??= import("@pierre/highlights");
    themes ??= Promise.all([
      import("@pierre/highlights/themes/github-light"),
      import("@pierre/highlights/themes/github-dark"),
    ]).then(([light, dark]) => ({ light: light.default, dark: dark.default }));
    const extension = file?.split(".").at(-1);
    const lang =
      extension === "css" || extension === "json"
        ? extension
        : extension === "ts"
          ? "typescript"
          : extension === "js"
            ? "javascript"
            : "tsx";
    void Promise.all([highlighter, themes])
      .then(([instance, themes]) => {
        const { tokens: lines } = instance.codeToTokens(code, {
          lang,
          themes,
          defaultColor: false,
          cssVariablePrefix: "--shiki-",
        });
        if (current) setHighlighted({ code, file, lines });
      })
      .catch(() => {
        // Keep the current source selectable if the optional highlighter cannot load.
      });
    return () => {
      current = false;
    };
  }, [active, near, code, file]);
  const lines =
    highlighted?.code === code && highlighted.file === file ? highlighted.lines : undefined;
  const sourceLines: SourceTokens =
    lines ?? code.split("\n").map((content) => [{ content, offset: 0, htmlStyle: {} }]);
  return (
    <span ref={root} data-highlighted={lines ? "" : undefined}>
      {sourceLines.map((line, row) => (
        <span key={row} data-source-line {...stylex.props(notebook.codeLine)}>
          <span aria-hidden="true" {...stylex.props(notebook.lineNumber)}>
            {row + 1}
          </span>
          {line.map((token, column) => (
            <span
              key={column}
              {...stylex.props(
                codeStyles.token(
                  token.htmlStyle?.["--shiki-light"] ?? "inherit",
                  token.htmlStyle?.["--shiki-dark"] ?? "inherit",
                ),
              )}
            >
              {token.content}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
