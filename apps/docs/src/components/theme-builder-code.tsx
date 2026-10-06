"use client";

// Adapted from HeroUI v3.2.6 CodePanel and ThemeCodePanel (e385ac2), Apache-2.0.
// Modified: native Lenso Modal, StyleX, safe Shiki tokens and builder export/import formats.
import { useDeferredValue, useEffect, useMemo, useState, type ChangeEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { ArrowDownToLine, Copy, Xmark } from "@gravity-ui/icons";
import { Button, Modal, Select } from "@lenso/ui";
import {
  builderCSS,
  builderTheme,
  builderVariables,
  type BuilderSettings,
} from "@/lib/theme-builder-model";
import { themeBuilderCode as s } from "@/styles/theme-builder-code.stylex";

type Format = "css" | "json" | "typescript";
interface Token {
  content: string;
  color?: string;
}
interface HighlightedSource {
  code: string;
  mode: "light" | "dark";
  format: Format;
  lines: Token[][];
}

export function ThemeBuilderCode({
  settings,
  mode,
  close,
  report,
  importSettings,
}: {
  settings: BuilderSettings;
  mode: "light" | "dark";
  close: () => void;
  report: (message: string) => void;
  importSettings: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [format, setFormat] = useState<Format>("css");
  const code = useMemo(() => {
    if (format === "css") return builderCSS(settings);
    if (format === "json") return JSON.stringify(settings, null, 2);
    return `import { defineTheme } from "@lenso/tokens";\n\nexport const theme = defineTheme(${JSON.stringify(builderTheme(settings), null, 2)});\n\n// Use this complete map with ThemeScope.style to retain the builder's derived overrides.\nexport const themeVariables = ${JSON.stringify({ light: builderVariables(settings, "light"), dark: builderVariables(settings, "dark") }, null, 2)};\n`;
  }, [settings, format]);
  const deferredCode = useDeferredValue(code);
  const [highlighted, setHighlighted] = useState<HighlightedSource | null>(null);

  useEffect(() => {
    let current = true;
    void import("shiki")
      .then(({ codeToTokens }) =>
        codeToTokens(deferredCode, {
          lang: format,
          theme: mode === "dark" ? "github-dark" : "github-light",
        }),
      )
      .then(
        ({ tokens }) => {
          if (current) setHighlighted({ code: deferredCode, mode, format, lines: tokens });
        },
        () => {
          // The current plain source remains selectable if highlighting cannot load.
        },
      );
    return () => {
      current = false;
    };
  }, [deferredCode, mode, format]);

  // Never display an old theme or language while a newer highlight is in flight.
  const lines =
    highlighted?.code === code && highlighted.mode === mode && highlighted.format === format
      ? highlighted.lines
      : code.split("\n").map((content) => [{ content } as Token]);
  const fileName = format === "css" ? "globals.css" : `theme.${format === "json" ? "json" : "ts"}`;
  const sourceLines = lines.map((tokens, row) => {
    let column = 0;
    return {
      number: row + 1,
      tokens: tokens.map((token) => {
        const start = column;
        column += token.content.length;
        return { ...token, start };
      }),
    };
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      report("Theme code copied.");
    } catch {
      report("Clipboard unavailable. Select the code to copy it.");
    }
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([code], { type: format === "json" ? "application/json" : "text/plain" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Modal.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Modal.Portal>
        <Modal.Backdrop xstyle={s.backdrop} />
        <Modal.Popup xstyle={s.panel}>
          <header {...stylex.props(s.header)}>
            <Modal.Title xstyle={s.title}>{fileName}</Modal.Title>
            <div {...stylex.props(s.actions)}>
              <Button variant="ghost" aria-label="Download code" onClick={download} xstyle={s.icon}>
                <ArrowDownToLine width={16} height={16} aria-hidden="true" />
              </Button>
              <Button variant="ghost" aria-label="Copy code" onClick={copy} xstyle={s.icon}>
                <Copy width={16} height={16} aria-hidden="true" />
              </Button>
              <Modal.Close aria-label="Close code panel" xstyle={s.icon}>
                <Xmark width={16} height={16} aria-hidden="true" />
              </Modal.Close>
            </div>
          </header>
          <section
            aria-label="Theme source code"
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to focus the overflow region to scroll source.
            tabIndex={0}
            {...stylex.props(s.scroll)}
          >
            <pre {...stylex.props(s.pre)}>
              <code>
                {sourceLines.map((line) => (
                  <span key={line.number} {...stylex.props(s.line)}>
                    <span aria-hidden="true" {...stylex.props(s.lineNumber)}>
                      {line.number}
                    </span>
                    <span {...stylex.props(s.lineSource)}>
                      {line.tokens.map((token) => (
                        <span
                          key={token.start}
                          {...stylex.props(s.token(token.color ?? "inherit"))}
                        >
                          {token.content}
                        </span>
                      ))}
                      {line.number < sourceLines.length ? "\n" : null}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </section>
          <textarea
            aria-label="Theme code"
            readOnly
            tabIndex={-1}
            value={code}
            spellCheck={false}
            {...stylex.props(s.hidden)}
          />
          <details {...stylex.props(s.options)}>
            <summary {...stylex.props(s.summary)}>Export options</summary>
            <div {...stylex.props(s.settings)}>
              <div {...stylex.props(s.label)}>
                <span id="builder-export-format-label">Export format</span>
                <Select
                  value={format}
                  onValueChange={(value) => {
                    if (value) setFormat(value as Format);
                  }}
                >
                  <Select.Trigger aria-labelledby="builder-export-format-label" xstyle={s.select}>
                    <Select.Value>
                      {format === "typescript" ? "TypeScript" : format.toUpperCase()}
                    </Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner>
                      <Select.Popup>
                        <Select.List>
                          {(["css", "json", "typescript"] as const).map((value) => (
                            <Select.Item key={value} value={value}>
                              <Select.ItemText>
                                {value === "typescript" ? "TypeScript" : value.toUpperCase()}
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select>
              </div>
              <label {...stylex.props(s.label)}>
                Import builder JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={importSettings}
                  {...stylex.props(s.file)}
                />
              </label>
              <p {...stylex.props(s.hint)}>
                Load @lenso/tokens/styles.css first. Apply data-lenso-theme="custom" and
                data-theme="light" or "dark" to your scope. JSON saves editable builder settings;
                changes are not saved automatically.
              </p>
            </div>
          </details>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
