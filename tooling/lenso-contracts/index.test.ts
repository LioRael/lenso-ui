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
  resolveSource,
  resolveTheme,
  type ContractInputs,
  type LensoContract,
} from "./index.ts";

function fixture(): ContractInputs {
  const source = { path: "packages/react/src/components/menu/menu.tsx", line: 12 };
  const part = (name: string, family = "menu") => ({
    name,
    signature: "({ children }: Props) => ReactElement",
    props: "RAC.Menu.Props",
    source: { ...source, path: `packages/react/src/components/${family}/${family}.tsx` },
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
        futureFamily: { parts: [part("FuturePart", "futureFamily")] },
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
    compatibility: {
      schemaVersion: 1,
      node: { range: "^26.10.0", testedVersion: "26.10.0" },
      stylex: {
        compiler: "@stylexjs/babel-plugin",
        version: "0.19.1",
        metadataFormat: "@lenso/stylex-build/raw-rules",
        metadataVersion: 1,
        compileMode: {
          dev: false,
          styleResolution: "property-specificity",
          classNamePrefix: "x",
          runtimeInjection: false,
        },
      },
      next: {
        version: "16.3.8",
        router: "App Router",
        bundler: "Webpack",
        customGlobalError: "explicit-css",
        explicitCss: { api: "prepareNext", mode: "production", watch: false, cache: false },
        legacyAssetRewrite: { customGlobalError: "unsupported", version: "16.3.8" },
        unsupportedBundlers: ["Turbopack", "Rspack"],
      },
      vite: { testedVersion: "8.3.2" },
    },
    sources: ["menu", "futureFamily"].map((family) => ({
      family,
      file: `packages/react/src/components/${family}/${family}.tsx`,
      code: "export const Menu = () => null;\r\n",
      files: [{ file: "packages/react/src/utils/shared.ts", code: "export const shared = 1;\n" }],
    })),
    theme: {
      files: [
        {
          file: "packages/styles/themes/default/index.css",
          code: ":root { --accent: oklch(0.62 0.195 253.83); }\n",
        },
      ],
      declarations: [
        {
          file: "packages/styles/themes/default/index.css",
          scope: [":root"],
          name: "--accent",
          value: "oklch(0.62 0.195 253.83)",
        },
      ],
      editableTokens: [{ key: "accent", label: "Accent", category: "color" }],
      editorSource: {
        file: "packages/styles/src/theme.ts",
        code: 'export const themeTokens = [{key: "accent", label: "Accent", category: "color"}];\n',
      },
    },
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
  assert.equal(first.formatVersion, 3);
  assert.equal(CONTRACT_FORMAT_VERSION, 3);
  assert.equal(fixture().docsIndex.formatVersion, 1);
  assert.equal(first.digest.length, 64);
  assert.equal(validateContract(first), first);
});

// A digest is integrity, not provenance: each forgery below carries its own correct digest.
test("rejects re-digested theme metadata that disagrees with included CSS/editor syntax", () => {
  const cases: ((contract: LensoContract) => void)[] = [
    (contract) => {
      contract.theme.declarations[0]!.value = "red";
    },
    (contract) => {
      contract.theme.declarations[0]!.scope = ['[data-theme="forged"]'];
    },
    (contract) => {
      contract.theme.declarations = [];
    },
    (contract) => {
      contract.theme.declarations.push({ ...contract.theme.declarations[0]!, name: "--invented" });
    },
    (contract) => {
      contract.theme.editableTokens[0]!.key = "invented";
    },
    (contract) => {
      contract.theme.editableTokens[0]!.category = "length";
    },
    (contract) => {
      contract.theme.editableTokens[0]!.label = "Invented label";
    },
    (contract) => {
      contract.theme.editableTokens = [];
    },
    (contract) => {
      contract.theme.editableTokens.push({ key: "invented", label: "Invented", category: "color" });
    },
  ];
  for (const mutate of cases) {
    const contract = buildLensoContract(fixture());
    mutate(contract);
    contract.digest = contractDigest(contract);
    assert.throws(() => validateContract(contract), /differ from included/);
  }
});

test("rejects nonempty metadata subsets with deleted declarations or editor categories", () => {
  const input = fixture();
  input.theme.files[0]!.code += ":root { --radius: 4px; }\n";
  input.theme.declarations.push({
    file: input.theme.files[0]!.file,
    scope: [":root"],
    name: "--radius",
    value: "4px",
  });
  input.theme.editableTokens.push({ key: "radius", label: "Radius", category: "length" });
  input.theme.editorSource.code =
    'export const themeTokens = [{key:"accent",label:"Accent",category:"color"},{key:"radius",label:"Radius",category:"length"}];';
  const original = buildLensoContract(input);
  for (const section of ["declarations", "editableTokens"] as const) {
    const contract = structuredClone(original);
    contract.theme[section].pop();
    contract.digest = contractDigest(contract);
    assert.throws(() => validateContract(contract), /differ from included/);
  }
});

test("rejects re-digested API extra fields at every closed nested boundary", () => {
  const cases: ((contract: LensoContract) => object)[] = [
    (contract) => contract.api,
    (contract) => contract.api.properties[0]!,
    (contract) => contract.api.properties[0]!.source,
    (contract) => contract.api.families["menu"]!,
    (contract) => contract.api.families["menu"]!.parts[0]!,
    (contract) => contract.api.families["menu"]!.parts[0]!.source,
    (contract) => contract.api.families["menu"]!.parts[0]!.states["MenuState"]![0]!,
  ];
  for (const target of cases) {
    const contract = buildLensoContract(fixture());
    Object.assign(target(contract), { invented: "not in the source schema" });
    contract.digest = contractDigest(contract);
    assert.throws(() => validateContract(contract), /unknown field: invented/);
  }
});

test("validates included local implementation imports, not only API provenance, after re-digesting", () => {
  const input = fixture();
  input.sources[0]!.code = 'export { shared } from "../../utils/shared.js";';
  const valid = buildLensoContract(input);
  assert.equal(validateContract(valid), valid);
  const missing = structuredClone(valid);
  missing.sources[0]!.helperFileRefs = [];
  missing.digest = contractDigest(missing);
  assert.throws(() => validateContract(missing), /missing local implementation helper/);
  for (const code of [
    'import("../../utils/missing.js");',
    'export * from "../../utils/missing.js";',
    'import "../../../../outside.ts";',
    'const file = "./helper"; import(file);',
    "import(`./helper`);",
  ]) {
    const contract = structuredClone(valid);
    contract.sourceFilePool[contract.sources[0]!.codeRef]!.code = code;
    contract.digest = contractDigest(contract);
    assert.throws(
      () => validateContract(contract),
      /missing local|outside packages|literal dynamic/,
    );
  }
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
  const cyclic: { self?: unknown } = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalSerialize({ value: undefined }), /undefined/);
  assert.throws(() => canonicalSerialize({ value: Number.NaN }), /non-finite/);
  assert.throws(() => canonicalSerialize(cyclic), /cyclic/);
  assert.throws(() => canonicalSerialize({ value: () => {} }), /function/);
});

test("validates complete shape even when malformed payload has a recomputed digest", () => {
  const malformed = (mutate: (contract: LensoContract) => void) => {
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
    Reflect.set(contract.api.families.menu.parts[0].properties, 0, "0");
  });
  malformed((contract) => {
    contract.api.families.menu.parts[0].properties[0] = 1;
  });
  malformed((contract) => {
    contract.api.properties[0].source.line = 0;
  });
  malformed((contract) => {
    Reflect.set(contract.api.properties[0], "default", false);
  });
  malformed((contract) => {
    Reflect.set(contract.api.families.menu.parts[0].states.MenuState[0], "required", "yes");
  });
  malformed((contract) => {
    Reflect.set(contract.api.families.menu.parts[0], "props", {});
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

test("accepts optional authored navigation metadata without relaxing document validation", () => {
  const input = fixture();
  input.docsIndex.pages[0].navigationGroup = "Handbook";
  input.docsIndex.pages[0].navigationOrder = 10;
  assert.doesNotThrow(() => buildLensoContract(input));
  Reflect.set(input.docsIndex.pages[0], "navigationOrder", "10");
  assert.throws(() => buildLensoContract(input), /navigationOrder/);
  input.docsIndex.pages[0].navigationOrder = -1;
  assert.throws(() => buildLensoContract(input), /navigationOrder/);
  delete input.docsIndex.pages[0].navigationGroup;
  input.docsIndex.pages[0].navigationOrder = 10;
  assert.throws(() => buildLensoContract(input), /navigationGroup/);
  input.docsIndex.pages[0].navigationGroup = "Handbook";
  Reflect.set(input.docs[0], "navigationGroup", "Handbook");
  assert.throws(() => buildLensoContract(input), /unknown document field/);
});

test("accepts safe component presentation metadata only in the docs index", () => {
  const input = fixture();
  const page = input.docsIndex.pages[0];
  page.componentCategory = "forms";
  page.componentThumbnail = "buttongroup";
  assert.doesNotThrow(() => buildLensoContract(input));

  for (const invalid of ["", "../forms", "Forms", "forms/group"]) {
    const malformed = fixture();
    malformed.docsIndex.pages[0].componentCategory = invalid;
    assert.throws(() => buildLensoContract(malformed), /componentCategory/);
  }

  for (const invalid of ["", "../button", "Button", "button/icon"]) {
    const malformed = fixture();
    malformed.docsIndex.pages[0].componentCategory = "forms";
    malformed.docsIndex.pages[0].componentThumbnail = invalid;
    assert.throws(() => buildLensoContract(malformed), /componentThumbnail/);
  }

  const withoutCategory = fixture();
  withoutCategory.docsIndex.pages[0].componentThumbnail = "buttongroup";
  assert.throws(() => buildLensoContract(withoutCategory), /componentThumbnail/);

  const authored = fixture();
  Reflect.set(authored.docs[0], "componentCategory", "forms");
  assert.throws(() => buildLensoContract(authored), /unknown (?:document )?field/);
  const encoded = buildLensoContract(fixture());
  Reflect.set(encoded.docs[0], "componentThumbnail", "buttongroup");
  assert.throws(() => validateContract(encoded), /unknown (?:document )?field/);
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
  assert.equal(contract.sourceFilePool.length, 9);
});

test("resolvers reject records from legacy or unrelated contracts", () => {
  const contract = buildLensoContract(fixture());
  assert.throws(
    () => resolveDoc({ ...contract, formatVersion: 1 }, contract.docs[0]),
    /unsupported formatVersion/,
  );
  assert.throws(() => resolveExample(contract, { ...contract.examples[0] }), /does not belong/);
});

// Existing Markdown/example checks cannot detect loss or stale identities in newly pooled source/theme data.
test("exact implementation and theme records round-trip through JSON with shared pooled helpers", () => {
  const input = fixture();
  const contract = validateContract(JSON.parse(canonicalSerialize(buildLensoContract(input))));
  assert.deepEqual(resolveSource(contract, contract.sources[0]), input.sources[0]);
  assert.deepEqual(resolveTheme(contract), input.theme);
  assert.equal(contract.sources[0].helperFileRefs[0], contract.sources[1].helperFileRefs[0]);
  for (const version of [1, 2]) {
    assert.throws(
      () => validateContract({ ...contract, formatVersion: version }),
      /unsupported formatVersion/,
    );
  }
});

test("changed implementation bytes, CSS bytes, raw values and editable metadata invalidate the digest", () => {
  const original = buildLensoContract(fixture());
  for (const mutate of [
    (contract: LensoContract) => {
      contract.sourceFilePool[contract.sources[0].codeRef].code += "\nchanged";
    },
    (contract: LensoContract) => {
      contract.sourceFilePool[contract.theme.fileRefs[0]].code += "\nchanged";
    },
    (contract: LensoContract) => {
      contract.theme.declarations[0].value = "var(--new-accent)";
    },
    (contract: LensoContract) => {
      contract.theme.editableTokens[0].label = "Changed";
    },
  ]) {
    const changed = structuredClone(original);
    mutate(changed);
    assert.throws(() => validateContract(changed), /digest mismatch/);
  }
});

test("rejects incomplete source coverage, forged roots, paths and theme references even with fresh digests", () => {
  for (const mutate of [
    (contract: LensoContract) => {
      contract.sources.pop();
    },
    (contract: LensoContract) => {
      contract.sources[0].file = "packages/react/src/utils/forged.ts";
    },
    (contract: LensoContract) => {
      contract.sourceFilePool[contract.sources[0].helperFileRefs[0]].file =
        "packages/primitives/forbidden.ts";
    },
    (contract: LensoContract) => {
      contract.sourceFilePool[contract.sources[0].codeRef].file = "../outside.ts";
    },
    (contract: LensoContract) => {
      contract.theme.declarations[0].file = "packages/styles/themes/missing.css";
    },
    (contract: LensoContract) => {
      contract.theme.editorSourceRef = 99999;
    },
    (contract: LensoContract) => {
      Reflect.set(contract.theme.declarations[0], "value", 42);
    },
    (contract: LensoContract) => {
      Reflect.set(contract.compatibility.next.explicitCss, "watch", "false");
    },
  ]) {
    const changed = buildLensoContract(fixture());
    mutate(changed);
    changed.digest = contractDigest(changed);
    assert.throws(() => validateContract(changed));
  }
});
