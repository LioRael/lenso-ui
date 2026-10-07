import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import jsonc from "@shikijs/langs/jsonc";
import json from "@shikijs/langs/json";
import yaml from "@shikijs/langs/yaml";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "./styles/notebook.stylex";
import { codeStyles } from "./styles/code.stylex";

// Fumadocs' pinned default themes; tokenization stays on the server.
const highlighter = createHighlighterCore({
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
  langs: [bash, css, html, javascript, json, jsonc, yaml, tsx, typescript],
  themes: [githubLight, githubDark],
});

const languageAliases: Record<string, string> = {
  bash: "bash",
  css: "css",
  html: "html",
  js: "javascript",
  javascript: "javascript",
  json: "json",
  jsonc: "jsonc",
  sh: "bash",
  shell: "bash",
  text: "text",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  yaml: "yaml",
  yml: "yaml",
};

export async function highlightSource(code: string, language = "tsx") {
  const lang = languageAliases[language.toLowerCase()] ?? "text";
  const instance = await highlighter;
  const tokens = instance.codeToTokensWithThemes(code.endsWith("\n") ? code.slice(0, -1) : code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
  });
  return tokens.map((line, index) => (
    <span key={index} {...stylex.props(notebook.codeLine)}>
      <span aria-hidden="true" {...stylex.props(notebook.lineNumber)}>
        {index + 1}
      </span>
      {line.length
        ? line.map((token, tokenIndex) => (
            <span
              key={tokenIndex}
              {...stylex.props(
                codeStyles.token(
                  token.variants?.["light"]?.color ?? "#24292e",
                  token.variants?.["dark"]?.color ?? "#e1e4e8",
                ),
              )}
            >
              {token.content}
            </span>
          ))
        : "\n"}
    </span>
  ));
}
