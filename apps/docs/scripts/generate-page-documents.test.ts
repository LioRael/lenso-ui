import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript-api";
import {
  documentReferences,
  generatePageDocuments,
  previewNames,
} from "./generate-page-documents.ts";
import { generateLiveRegistry } from "./generate-live-registry.ts";

function inspect(code: string) {
  const tree = ts.createSourceFile(
    "page.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const targets: string[] = [];
  const entries: Record<string, string> = {};
  const exports: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      assert.ok(ts.isStringLiteral(node.arguments[0]), "dynamic targets must be literal imports");
      targets.push(node.arguments[0].text);
    }
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "demos") {
      assert.ok(node.initializer && ts.isObjectLiteralExpression(node.initializer));
      for (const property of node.initializer.properties) {
        assert.ok(ts.isPropertyAssignment(property));
        assert.ok(ts.isStringLiteral(property.name) || ts.isIdentifier(property.name));
        assert.ok(ts.isIdentifier(property.initializer));
        entries[property.name.text] = property.initializer.text;
      }
    }
    if (ts.isElementAccessExpression(node) && node.expression.getText(tree) === "module") {
      assert.ok(ts.isStringLiteral(node.argumentExpression));
      exports.push(node.argumentExpression.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return { targets, entries, exports };
}

// The projection inventory includes more examples than prose actually renders.
// Neither global registry coverage nor inventory-only tests prove route-local loading.
test("emits only authored page targets with locale resolution, export selection and alias deduplication", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-page-documents-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const put = async (file: string, text: string) => {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), text);
  };
  const entries = {
    basic: { source: "apps/docs/src/demos/en/field/basic.tsx", exported: "Chosen" },
    alias: { source: "apps/docs/src/demos/en/field/basic.tsx", exported: "Chosen" },
    fallback: { source: "apps/docs/src/demos/en/field/fallback.tsx" },
    reuse: { source: "apps/docs/src/demos/en/field/reuse.tsx" },
    unrelated: { source: "apps/docs/src/demos/en/field/unrelated.tsx" },
  };
  await put("content/source-index.json", JSON.stringify({ examples: { en: entries, cn: {} } }));
  await put(
    "src/demos/en/field/basic.tsx",
    "export function Other() { return null; }\nexport function Chosen() { return null; }",
  );
  await put(
    "src/demos/cn/field/basic.tsx",
    "export const styles = {};\nexport function Chosen() { return null; }",
  );
  for (const name of ["fallback", "reuse", "unrelated"])
    await put(`src/demos/en/field/${name}.tsx`, "export default function Demo() { return null; }");
  await generateLiveRegistry(directory, { cn: { reuse: "en/field/reuse.tsx" } });
  const pages = [
    { locale: "en", slug: "react/components/field", markdownFile: "content/field-en.mdx" },
    { locale: "cn", slug: "react/components/field", markdownFile: "content/field-cn.mdx" },
    {
      locale: "en",
      slug: "react/start",
      markdownFile: "content/start.mdx",
      examples: [{ name: "unrelated" }],
    },
  ];
  await put("src/generated/lenso-docs-index.json", JSON.stringify({ pages }));
  await put(
    "content/field-en.mdx",
    '<ComponentPreview name="basic" />\n\n<ComponentPreview name="alias" />',
  );
  await put(
    "content/field-cn.mdx",
    '<ComponentPreview name="basic" />\n\n<ComponentPreview name="fallback" />\n\n<ComponentPreview name="reuse" />',
  );
  await put(
    "content/start.mdx",
    '# Prose\n\n```mdx\n<ComponentPreview name="unrelated" />\n```\n\n{/* <ComponentPreview name="unrelated" /> */}',
  );
  const outputs = await generatePageDocuments(directory);
  assert.equal(outputs.length, 5, "preview-free pages need only one server module");
  const read = (file: string) =>
    readFile(path.join(directory, "src/generated/documents", file), "utf8");
  const enClient = inspect(await read("en/react/components/field.client.tsx"));
  assert.deepEqual(
    enClient.targets.map((target) => path.basename(target)),
    ["basic"],
  );
  assert.deepEqual(enClient.exports, ["Chosen"]);
  const en = inspect(await read("en/react/components/field.tsx"));
  assert.deepEqual(en.entries, { basic: "Demo0", alias: "Demo0" });
  const cnClient = inspect(await read("cn/react/components/field.client.tsx"));
  assert.deepEqual(
    cnClient.targets.map((target) => target.split("/").slice(-3).join("/")),
    ["cn/field/basic", "en/field/fallback", "en/field/reuse"],
  );
  assert.deepEqual(cnClient.exports, ["Chosen", "default", "default"]);
  assert.deepEqual(inspect(await read("cn/react/components/field.tsx")).entries, {
    basic: "Demo0",
    fallback: "Demo1",
    reuse: "Demo2",
  });
  const prose = await read("en/react/start.tsx");
  assert.deepEqual(inspect(prose), { targets: [], entries: {}, exports: [] });
  assert.ok(!prose.includes(".client"));
  assert.ok(!prose.includes("demos/generated"));
  assert.ok(!prose.includes("component-preview"), "prose must not load demo source parsers");
  assert.ok(!prose.includes("native-api-reference"), "ordinary prose must not load API tables");
  assert.ok(!prose.includes("color-section"), "ordinary prose must not load color controls");
  assert.ok(
    (await read("en/react/components/field.tsx")).includes("native-api-reference"),
    "component pages need the API renderer inserted by the heading transform",
  );
  const clientCode = await read("cn/react/components/field.client.tsx");
  assert.ok(clientCode.includes('"data-example-mounted"'));
  assert.ok(clientCode.includes("ssr: false"));
  const before = await stat(path.join(directory, outputs[0]));
  await generatePageDocuments(directory);
  assert.equal((await stat(path.join(directory, outputs[0]))).mtimeMs, before.mtimeMs);
  await put("content/field-en.mdx", "# Now prose only");
  await put("src/generated/documents/en/stale.tsx", "// obsolete");
  await put("src/generated/outside.tsx", "// not owned");
  const cnBefore = await stat(
    path.join(directory, "src/generated/documents/cn/react/components/field.tsx"),
  );
  await generatePageDocuments(directory, { pageIds: ["en/react/components/field"] });
  await assert.rejects(read("en/react/components/field.client.tsx"), { code: "ENOENT" });
  assert.equal(await read("en/stale.tsx"), "// obsolete", "a page edit cannot prune other pages");
  assert.equal(
    (await stat(path.join(directory, "src/generated/documents/cn/react/components/field.tsx")))
      .mtimeMs,
    cnBefore.mtimeMs,
  );
  await generatePageDocuments(directory);
  await assert.rejects(read("en/react/components/field.client.tsx"), { code: "ENOENT" });
  await assert.rejects(read("en/stale.tsx"), { code: "ENOENT" });
  assert.equal(
    await readFile(path.join(directory, "src/generated/outside.tsx"), "utf8"),
    "// not owned",
  );
});

test("page extensions follow real MDX tags without restricting local imports or expressions", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-mdx-extensions-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const put = async (file: string, value: string) => {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), value);
  };
  await put("content/source-index.json", '{"examples":{"en":{},"cn":{}}}');
  await put("src/demos/live-manifest.json", '{"en":{},"cn":{}}');
  const markdown = `import Local from './local'
export const show = true

# Color guide

<Local render={<ColorSectionPrimitive colors={[]} />} />

{show && <ColorSectionStacked lightColors={[]} darkColors={[]} />}

<ComponentsCategory category="controls" />

<NativeApiReference family="button" />

\`\`\`mdx
<ColorSectionFormField colors={{}} />
\`\`\`

{/* <ColorSectionSideBySide /> */}`;
  await put("content/colors.mdx", markdown);
  await put(
    "src/generated/lenso-docs-index.json",
    JSON.stringify({
      pages: [
        { locale: "cn", slug: "react/getting-started/colors", markdownFile: "content/colors.mdx" },
      ],
    }),
  );
  const references = await documentReferences(markdown);
  assert.deepEqual(
    new Set(references.components),
    new Set([
      "Local",
      "ColorSectionPrimitive",
      "ColorSectionStacked",
      "ComponentsCategory",
      "NativeApiReference",
    ]),
  );
  await generatePageDocuments(directory);
  const code = await readFile(
    path.join(directory, "src/generated/documents/cn/react/getting-started/colors.tsx"),
    "utf8",
  );
  assert.match(code, /import\s*\{\s*ColorSectionStacked,\s*ColorSectionPrimitive,?\s*\}/);
  assert.ok(code.includes("native-api-reference"));
  assert.ok(code.includes("components-category"));
  assert.ok(code.includes('page.locale === "cn"'));
  assert.ok(!code.includes("ColorSectionFormField"));
  assert.ok(!code.includes("ColorSectionSideBySide"));
  assert.equal(await readFile(path.join(directory, "content/colors.mdx"), "utf8"), markdown);
});

test("MDX inventory ignores code and comments, deduplicates real references and rejects dynamic names", async () => {
  assert.deepEqual(
    await previewNames(
      '---\ntitle: Demo\n---\n<ComponentPreview name="one" />\n\n<ComponentPreview name="one" />',
    ),
    ["one"],
  );
  await assert.rejects(previewNames("<ComponentPreview name={scenario} />"), /literal name/);
});

test("rejects document traversal before writing outside the owned output directory", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-page-path-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "src/generated"), { recursive: true });
  await mkdir(path.join(directory, "src/demos"), { recursive: true });
  await mkdir(path.join(directory, "content"), { recursive: true });
  await writeFile(path.join(directory, "src/demos/live-manifest.json"), '{"en":{},"cn":{}}');
  await writeFile(path.join(directory, "content/source-index.json"), '{"examples":{"en":{}}}');
  await writeFile(
    path.join(directory, "src/generated/lenso-docs-index.json"),
    JSON.stringify({
      pages: [{ locale: "en", slug: "../escape", markdownFile: "content/safe.mdx" }],
    }),
  );
  await assert.rejects(generatePageDocuments(directory), /Unsafe document path/);
});
