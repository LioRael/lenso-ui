import { codeToTokens, isSupportedLanguage } from "@pierre/highlights";
import githubLight from "@pierre/highlights/themes/github-light";
import githubDark from "@pierre/highlights/themes/github-dark";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "./styles/notebook.stylex";
import { codeStyles } from "./styles/code.stylex";

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
  const alias = languageAliases[language.toLowerCase()] ?? "text";
  const lang = isSupportedLanguage(alias) ? alias : "text";
  const { tokens } = codeToTokens(code.endsWith("\n") ? code.slice(0, -1) : code, {
    lang,
    themes: { light: githubLight, dark: githubDark },
    defaultColor: false,
    cssVariablePrefix: "--shiki-",
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
                  token.htmlStyle?.["--shiki-light"] ?? "#24292e",
                  token.htmlStyle?.["--shiki-dark"] ?? "#e1e4e8",
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
