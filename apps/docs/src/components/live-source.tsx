"use client";

import { useEffect, useState } from "react";
import type { HighlighterCore, ThemedTokenWithVariants } from "shiki";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";
import { codeStyles } from "@/styles/code.stylex";

let highlighter: Promise<HighlighterCore> | undefined;

export function LiveSource({
  code,
  file,
  active,
}: {
  code: string;
  file?: string;
  active: boolean;
}) {
  const [highlighted, setHighlighted] = useState<{
    code: string;
    file: string | undefined;
    lines: ThemedTokenWithVariants[][];
  }>();
  useEffect(() => {
    if (!active) return;
    let current = true;
    highlighter ??= Promise.all([
      import("shiki/core"),
      import("shiki/engine/oniguruma"),
      import("shiki/langs/tsx.mjs"),
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/css.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ]).then(
      ([
        { createHighlighterCore },
        { createOnigurumaEngine },
        tsx,
        ts,
        js,
        css,
        json,
        light,
        dark,
      ]) =>
        createHighlighterCore({
          engine: createOnigurumaEngine(() => import("shiki/wasm")),
          langs: [tsx.default, ts.default, js.default, css.default, json.default],
          themes: [light.default, dark.default],
        }),
    );
    const extension = file?.split(".").at(-1);
    const lang =
      extension === "css" || extension === "json"
        ? extension
        : extension === "ts"
          ? "typescript"
          : extension === "js"
            ? "javascript"
            : "tsx";
    void highlighter
      .then((instance) => {
        const lines = instance.codeToTokensWithThemes(code, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
        });
        if (current) setHighlighted({ code, file, lines });
      })
      .catch(() => {
        // Keep the current source selectable if the optional highlighter cannot load.
      });
    return () => {
      current = false;
    };
  }, [active, code, file]);
  const lines =
    highlighted?.code === code && highlighted.file === file ? highlighted.lines : undefined;
  const sourceLines: ThemedTokenWithVariants[][] =
    lines ?? code.split("\n").map((content) => [{ content, offset: 0, variants: {} }]);
  return (
    <span data-highlighted={lines ? "" : undefined}>
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
                  token.variants["light"]?.color ?? "inherit",
                  token.variants["dark"]?.color ?? "inherit",
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
