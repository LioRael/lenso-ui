"use client";

import { useEffect, useRef, useState } from "react";
import type { HighlighterCore, ThemedTokenWithVariants } from "shiki";
import * as stylex from "@stylexjs/stylex";
import { notebook, codeStyles } from "@lenso/docs/presentation";

let highlighter: Promise<HighlighterCore> | undefined;
const languages = {
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  json: () => import("shiki/langs/json.mjs"),
};
const loadedLanguages = new Map<string, Promise<void>>();

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
    lines: ThemedTokenWithVariants[][];
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
    highlighter ??= Promise.all([
      import("shiki/core"),
      import("shiki/engine/oniguruma"),
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ]).then(([{ createHighlighterCore }, { createOnigurumaEngine }, light, dark]) =>
      createHighlighterCore({
        engine: createOnigurumaEngine(() => import("shiki/wasm")),
        langs: [],
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
    let loaded = loadedLanguages.get(lang);
    if (!loaded) {
      loaded = highlighter.then(async (instance) => {
        const grammar = await languages[lang]();
        await instance.loadLanguage(grammar.default);
      });
      loadedLanguages.set(lang, loaded);
    }
    void Promise.all([highlighter, loaded])
      .then(([instance]) => {
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
  }, [active, near, code, file]);
  const lines =
    highlighted?.code === code && highlighted.file === file ? highlighted.lines : undefined;
  const sourceLines: ThemedTokenWithVariants[][] =
    lines ?? code.split("\n").map((content) => [{ content, offset: 0, variants: {} }]);
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
