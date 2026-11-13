import { codeToTokens, isSupportedLanguage } from "@pierre/highlights";
import githubLight from "@pierre/highlights/themes/github-light";
import githubDark from "@pierre/highlights/themes/github-dark";

interface Node {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  value?: string;
  children?: Node[];
}

// Run while compiling MDX so static HTML has colors without shipping the highlighter.
export function rehypeHighlight() {
  return (tree: Node) => {
    function visit(node: Node) {
      if (node.tagName === "pre") {
        const code = node.children?.find((child) => child.tagName === "code");
        if (!code) return;
        const classes = code.properties?.["className"];
        const label = Array.isArray(classes)
          ? classes.find((name: string) => name.startsWith("language-"))?.slice(9)
          : undefined;
        const aliases: Record<string, string> = {
          ts: "typescript",
          js: "javascript",
          sh: "bash",
          shell: "bash",
          yml: "yaml",
        };
        const language = aliases[label ?? ""] ?? label ?? "text";
        const source = (code.children ?? []).map((child) => child.value ?? "").join("");
        const { tokens } = codeToTokens(source.replace(/\n$/, ""), {
          lang: isSupportedLanguage(language) ? language : "text",
          themes: { light: githubLight, dark: githubDark },
          defaultColor: false,
          cssVariablePrefix: "--shiki-",
        });
        code.children = tokens.flatMap((line, index) => [
          ...(index ? [{ type: "text", value: "\n" }] : []),
          ...line.map((token): Node => ({
            type: "element",
            tagName: "span",
            properties: {
              style: Object.entries(token.htmlStyle ?? {})
                .map(([key, value]) => `${key}:${value}`)
                .join(";"),
            },
            children: [{ type: "text", value: token.content }],
          })),
        ]);
        return;
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
  };
}
