import { codeToTokensWithThemes, bundledLanguages } from "shiki";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";
import { codeStyles } from "@/styles/code.stylex";

// Fumadocs' pinned default themes; tokenization stays on the server.
export async function highlightSource(code: string, language = "tsx") {
  const lang = language in bundledLanguages ? (language as keyof typeof bundledLanguages) : "text";
  const tokens = await codeToTokensWithThemes(code.endsWith("\n") ? code.slice(0, -1) : code, {
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
