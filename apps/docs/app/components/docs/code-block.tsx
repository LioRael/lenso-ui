"use client";

import { useEffect, useState } from "react";
import { codeToHtml, type BundledLanguage } from "shiki/bundle/web";

const themes = {
  dark: "github-dark-default",
  light: "github-light-default",
} as const;

function getCodeMarkup(highlighted: string) {
  const match = highlighted.match(/<code[^>]*>([\s\S]*)<\/code>/);
  return match?.[1] ?? "";
}

function formatCode(code: string) {
  const lines = code.replace(/\r\n?/g, "\n").split("\n");

  while (lines[0]?.trim() === "") {
    lines.shift();
  }

  while (lines.at(-1)?.trim() === "") {
    lines.pop();
  }

  const nonEmptyLines = lines.filter((line) => line.trim() !== "");
  const commonIndent = nonEmptyLines.length
    ? Math.min(...nonEmptyLines.map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0))
    : 0;

  return lines.map((line) => (line.trim() === "" ? "" : line.slice(commonIndent))).join("\n");
}

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: BundledLanguage;
}) {
  const source = formatCode(code);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setHighlighted(null);
    void codeToHtml(source, {
      defaultColor: false,
      lang: language,
      themes,
    })
      .then((html) => {
        if (!cancelled) setHighlighted(getCodeMarkup(html));
      })
      .catch(() => {
        if (!cancelled) setHighlighted("");
      });

    return () => {
      cancelled = true;
    };
  }, [language, source]);

  if (!highlighted) {
    return (
      <pre data-language={language}>
        <code>{source}</code>
      </pre>
    );
  }

  return (
    <pre
      className="shiki shiki-themes github-light-default github-dark-default"
      data-language={language}
      dangerouslySetInnerHTML={{ __html: `<code>${highlighted}</code>` }}
    />
  );
}
