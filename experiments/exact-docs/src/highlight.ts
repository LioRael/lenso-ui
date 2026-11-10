import { createHighlighter, bundledLanguages, bundledLanguagesInfo } from "shiki";
import { walk, type DocumentNode, type Token } from "./content.ts";

const categories: [RegExp, string][] = [
  [/^comment/, "comment"],
  [/^(keyword|storage)/, "keyword"],
  [/^string/, "string"],
  [/^constant.numeric/, "number"],
  [/^(entity.name.type|support.type)/, "type"],
  [/^(entity.name.function|support.function)/, "function"],
  [/^punctuation/, "punctuation"],
];
function category(scopes: string[]) {
  for (const scope of [...scopes].reverse())
    for (const [pattern, kind] of categories) if (pattern.test(scope)) return kind;
  return "plain";
}

/** TextMate scopes and semantic categories only; no theme palette or browser grammar. */
export async function highlightDocuments(documents: { body?: DocumentNode[] }[]) {
  const blocks = documents
    .flatMap((doc) => [...walk(doc.body ?? [])])
    .filter((node) => node.kind === "code");
  const language = (name: string) =>
    bundledLanguagesInfo.find((info) => info.id === name || info.aliases?.includes(name));
  const ids = [
    ...new Set(
      blocks.map((block) => language(block.language)?.id).filter((id) => id !== undefined),
    ),
  ];
  const highlighter = await createHighlighter({
    themes: [],
    langs: ids.map((id) => bundledLanguages[id as keyof typeof bundledLanguages]),
  });
  try {
    for (const block of blocks) {
      const info = language(block.language);
      if (!info) {
        block.tokens = [{ text: block.value, kind: "plain", scopes: [] }];
        continue;
      }
      const grammar = highlighter.getLanguage(info.id);
      let state: ReturnType<typeof grammar.tokenizeLine>["ruleStack"] | null = null;
      const lines = block.value.split("\n"),
        tokens: Token[] = [];
      for (const [index, line] of lines.entries()) {
        const result = grammar.tokenizeLine(line, state);
        state = result.ruleStack;
        for (const token of result.tokens) {
          const text = line.slice(token.startIndex, token.endIndex);
          if (text) tokens.push({ text, kind: category(token.scopes), scopes: token.scopes });
        }
        if (index < lines.length - 1) tokens.push({ text: "\n", kind: "plain", scopes: [] });
      }
      block.tokens = tokens;
    }
  } finally {
    highlighter.dispose();
  }
}
