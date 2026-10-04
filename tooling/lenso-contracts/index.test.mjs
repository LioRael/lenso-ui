import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildLensoContract,
  canonicalSerialize,
  contractDigest,
  CONTRACT_FORMAT_VERSION,
  DOCS_INDEX_FORMAT_VERSION,
  resolveDoc,
  resolveExample,
  resolveStyle,
  validateContract,
  validateExamplePath,
} from "./index.mjs";

function fixture() {
  const source = { path: "packages/react/src/components/menu/menu.tsx", line: 12 };
  const part = (name) => ({
    name,
    signature: "({ children }: Props) => ReactElement",
    props: "RAC.Menu.Props",
    source,
    native: ["react-aria-components"],
    members: [],
    states: { MenuState: [{ name: "open", type: "boolean", required: true }] },
    properties: [0],
  });
  return {
    apiReference: {
      upstream: { version: "source-version" },
      properties: [
        {
          name: "children",
          type: "ReactNode",
          expandedType: "ReactNode",
          required: false,
          description: "",
          source,
          default: null,
        },
      ],
      families: {
        menu: { parts: [part("Menu")] },
        futureFamily: { parts: [part("FuturePart")] },
      },
    },
    docsIndex: {
      formatVersion: DOCS_INDEX_FORMAT_VERSION,
      lensoVersion: "0.9.0",
      sourceFamilyMapping: { dropdown: "menu" },
      pages: [
        {
          locale: "en",
          slug: "menu",
          title: "Menu",
          description: "Menu docs",
          markdownFile: "menu.md",
          examples: [
            { name: "basic", file: "menu/basic.tsx" },
            { name: "second", file: "menu/second.tsx" },
          ],
        },
        {
          locale: "en",
          slug: "futureFamily",
          title: "Future",
          description: "Future docs",
          markdownFile: "future.md",
          examples: [],
        },
      ],
    },
    packageVersions: { "@lenso/ui": "0.9.0", "@lenso/tokens": "0.9.0" },
    compatibility: { stylex: { supported: true } },
    docs: [
      { locale: "en", slug: "menu", title: "Menu", description: "Menu docs", markdown: "# Menu\n" },
      {
        locale: "en",
        slug: "futureFamily",
        title: "Future",
        description: "Future docs",
        markdown: "# Future\n",
      },
    ],
    examples: [
      {
        name: "basic",
        locale: "en",
        file: "menu/basic.tsx",
        code: "<Menu />",
        files: [{ file: "shared/helper.ts", code: "export const helper = 1;\n" }],
      },
      {
        name: "second",
        locale: "en",
        file: "menu/second.tsx",
        code: "<Menu.Second />",
        files: [{ file: "shared/helper.ts", code: "export const helper = 1;\n" }],
      },
    ],
  };
}

test("contract is deterministic and preserves the source API payload", () => {
  const first = buildLensoContract(fixture());
  const second = buildLensoContract(fixture());
  assert.equal(canonicalSerialize(first), canonicalSerialize(second));
  assert.deepEqual(first.api, fixture().apiReference);
  assert.equal(first.api.families.futureFamily.parts.length, 1);
  assert.equal(
    first.api.families.menu.parts[0].props,
    "RAC.Menu.Props",
    "unrecognized React Aria type text remains unchanged",
  );
  assert.deepEqual(first.styles, []);
  assert.deepEqual(resolveDoc(first, first.docs[0]), fixture().docs[0]);
  assert.deepEqual(resolveExample(first, first.examples[0]), fixture().examples[0]);
  assert.equal(first.examples[0].helperFileRefs[0], first.examples[1].helperFileRefs[0]);
  assert.equal(first.formatVersion, 2);
  assert.equal(CONTRACT_FORMAT_VERSION, 2);
  assert.equal(fixture().docsIndex.formatVersion, 1);
  assert.equal(first.digest.length, 64);
  assert.equal(validateContract(first), first);
});

test("rejects version and digest mismatches and incomplete source coverage", () => {
  const input = fixture();
  input.packageVersions["@lenso/tokens"] = "1.0.0";
  assert.throws(() => buildLensoContract(input), /versions must match/);
  const contract = buildLensoContract(fixture());
  contract.markdownLinePool[0] += "changed";
  assert.throws(() => validateContract(contract), /digest mismatch/);
  assert.throws(() => buildLensoContract({ ...fixture(), docs: [] }), /cover every indexed page/);
});

test("rejects traversal paths and symlinks escaping the examples root", async () => {
  assert.throws(() => validateExamplePath("../outside.tsx"), /escapes its root/);
  assert.throws(() => validateExamplePath("/outside.tsx"), /escapes its root/);
  const root = await mkdtemp(join(tmpdir(), "lenso-contract-"));
  const outside = await mkdtemp(join(tmpdir(), "lenso-outside-"));
  try {
    await mkdir(join(root, "examples"));
    await writeFile(join(outside, "escape.tsx"), "outside");
    await symlink(join(outside, "escape.tsx"), join(root, "examples", "escape.tsx"));
    assert.throws(() => validateExamplePath("examples/escape.tsx", root), /escapes its root/);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test("canonical serialization rejects non-JSON values", () => {
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalSerialize({ value: undefined }), /undefined/);
  assert.throws(() => canonicalSerialize({ value: Number.NaN }), /non-finite/);
  assert.throws(() => canonicalSerialize(cyclic), /cyclic/);
  assert.throws(() => canonicalSerialize({ value: () => {} }), /function/);
});

test("validates complete shape even when malformed payload has a recomputed digest", () => {
  const malformed = (mutate) => {
    const contract = buildLensoContract(fixture());
    mutate(contract);
    contract.digest = contractDigest(contract);
    assert.throws(() => validateContract(contract));
  };
  malformed((contract) => {
    contract.docs[0].locale = "fr";
  });
  malformed((contract) => {
    contract.docs = contract.docs.filter((doc) => doc.slug !== "futureFamily");
  });
  malformed((contract) => {
    contract.api.families.dropdown = contract.api.families.menu;
  });
  malformed((contract) => {
    contract.api.families.menu.parts[0].properties[0] = "0";
  });
  malformed((contract) => {
    contract.api.families.menu.parts[0].properties[0] = 1;
  });
  malformed((contract) => {
    contract.api.properties[0].source.line = 0;
  });
  malformed((contract) => {
    contract.api.properties[0].default = false;
  });
  malformed((contract) => {
    contract.api.families.menu.parts[0].states.MenuState[0].required = "yes";
  });
  malformed((contract) => {
    contract.api.families.menu.parts[0].props = {};
  });
  malformed((contract) => {
    contract.examples[0].codeRef = 10000;
  });
  malformed((contract) => {
    contract.sourceFilePool.push({ ...contract.sourceFilePool[0] });
  });
  malformed((contract) => {
    contract.markdownLinePool.push(contract.markdownLinePool[0]);
  });
  malformed((contract) => {
    contract.docs[0].markdownLineRefs[0] = 9999;
  });
  malformed((contract) => {
    contract.examples[0].file = "other/path.tsx";
  });
  malformed((contract) => {
    contract.styles = [{ family: "menu", file: "bad.ts", codeRef: 9999 }];
  });
});

test("rejects unknown locales, missing family docs, and indexed example file mismatches", () => {
  const unsupportedLocale = fixture();
  unsupportedLocale.docs[0].locale = "fr";
  assert.throws(() => buildLensoContract(unsupportedLocale), /unsupported locale/);

  const missingFamily = fixture();
  missingFamily.docsIndex.pages = missingFamily.docsIndex.pages.filter(
    (page) => page.slug !== "futureFamily",
  );
  assert.throws(() => buildLensoContract(missingFamily), /no associated docs page/);

  const mismatchedFile = fixture();
  mismatchedFile.examples[0].file = "menu/other.tsx";
  assert.throws(() => buildLensoContract(mismatchedFile), /does not match docs index/);
});

test("rejects Windows absolute and duplicate file paths", () => {
  assert.throws(() => validateExamplePath("C:\\outside.tsx"), /escapes its root/);
  const duplicateFiles = fixture();
  duplicateFiles.examples[0].files = [
    { file: "menu/shared.tsx", code: "one" },
    { file: "menu/shared.tsx", code: "two" },
  ];
  assert.throws(() => buildLensoContract(duplicateFiles), /conflicting source file code/);
});

test("includes actual source StyleX files and rejects unknown or unsafe style entries", () => {
  const input = fixture();
  input.styles = [
    {
      family: "menu",
      file: "packages/styles/src/components/menu/menu.styles.ts",
      code: "export const menuStyles = stylex.create({});",
    },
  ];
  const contract = buildLensoContract(input);
  assert.deepEqual(resolveStyle(contract, contract.styles[0]), input.styles[0]);
  assert.equal(validateContract(contract), contract);

  const unknownFamily = fixture();
  unknownFamily.styles = [{ family: "unknown", file: "unknown.ts", code: "x" }];
  assert.throws(() => buildLensoContract(unknownFamily), /unknown style family/);

  const unsafePath = fixture();
  unsafePath.styles = [{ family: "menu", file: "C:\\outside.ts", code: "x" }];
  assert.throws(() => buildLensoContract(unsafePath), /escapes its root/);
});

test("losslessly interns CRLF, repeated lines, trailing newlines, helper files, and style aliases", () => {
  const input = fixture();
  input.docs[0].markdown = "你好\r\nrepeated\n\n";
  input.docs[1].markdown = "repeated\nlast\n";
  input.examples[0].code = "const first = 1;\r\n";
  input.styles = [
    { family: "menu", file: "shared/menu.stylex.ts", code: "const styles = {};\n" },
    { family: "futureFamily", file: "shared/menu.stylex.ts", code: "const styles = {};\n" },
  ];
  const contract = buildLensoContract(input);
  assert.equal(resolveDoc(contract, contract.docs[0]).markdown, input.docs[0].markdown);
  assert.equal(resolveDoc(contract, contract.docs[1]).markdown, input.docs[1].markdown);
  assert.equal(resolveExample(contract, contract.examples[0]).code, input.examples[0].code);
  assert.equal(contract.styles[0].codeRef, contract.styles[1].codeRef);
  assert.deepEqual(resolveStyle(contract, contract.styles[1]), input.styles[1]);
  assert.equal(
    contract.docs[0].markdownLineRefs.find(
      (ref) => contract.markdownLinePool[ref] === "repeated\n",
    ),
    contract.docs[1].markdownLineRefs.find(
      (ref) => contract.markdownLinePool[ref] === "repeated\n",
    ),
  );
  assert.equal(contract.sourceFilePool.length, 4);
});

test("resolvers reject records from legacy or unrelated contracts", () => {
  const contract = buildLensoContract(fixture());
  assert.throws(
    () => resolveDoc({ ...contract, formatVersion: 1 }, contract.docs[0]),
    /unsupported formatVersion/,
  );
  assert.throws(() => resolveExample(contract, { ...contract.examples[0] }), /does not belong/);
});
