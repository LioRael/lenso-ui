import { expect, test } from "bun:test";
import { compileBodies } from "../src/body.ts";
import { parseMarkdown } from "../src/markdown.ts";

// Literal-renderer coverage cannot catch content leaking into shared templates or block-key collisions.
test("different pages share native templates while keeping text and repeated paragraphs in page data", () => {
  const documents = [
    "# First\n\nPrivate body alpha.\n\nRepeated.\n\nRepeated.",
    "# Second\n\nPrivate body beta.",
  ].map((markdown, index) => ({
    path: `/${index}`,
    markdown,
    body: parseMarkdown(markdown, (href) => href).nodes,
  }));
  const compiled = compileBodies(documents, {});
  expect(compiled.contract).not.toContain("Private body");
  expect(compiled.contract).not.toContain("First");
  const first = compiled.pages.get("/0")!,
    second = compiled.pages.get("/1")!;
  expect(first.blocks[1]?.template).toBe(second.blocks[1]?.template);
  expect(first.blocks[1]?.strings).toEqual(["Private body alpha."]);
  expect(second.blocks[1]?.strings).toEqual(["Private body beta."]);
  expect(new Set(first.blocks.map((block) => block.id)).size).toBe(first.blocks.length);
  expect(first.blocks.filter((block) => block.strings.includes("Repeated.")).length).toBe(2);
  expect(JSON.parse(JSON.stringify(first))).toEqual(first);
});

test("nested code retains its own token groups and widget props keep native literal types", () => {
  const markdown =
    "```exact-component\n" +
    JSON.stringify({
      name: "Counter",
      props: { tone: "primary", initial: 2 },
      children: '```ts\nconst first = "<tag>";\n```\n\n```ts\nconst second = 2;\n```',
    }) +
    "\n```";
  const compiled = compileBodies(
    [{ path: "/", markdown, body: parseMarkdown(markdown, (href) => href).nodes }],
    { Counter: "DocsEmbed0" },
  );
  expect(compiled.contract).toContain('DocsEmbed0(tone="primary", initial=2)');
  const block = compiled.pages.get("/")!.blocks[0]!;
  expect(block.tokens.map((token) => token.text).join("")).toBe(
    'const first = "<tag>";\nconst second = 2;\n',
  );
  expect(new Set(block.tokens.map((token) => token.group)).size).toBe(2);
  expect(compiled.contract).not.toContain("const first");
});
