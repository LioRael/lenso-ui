import { createHash } from "node:crypto";
import { lstatSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import type {
  ApiFamily,
  ApiReference,
  ContractInputs,
  Doc,
  DocMetadata,
  DocsIndex,
  EncodedDoc,
  EncodedExample,
  EncodedSource,
  EncodedStyle,
  Example,
  LensoContract,
  Provenance,
  Schema,
  Source,
  SourceFile,
  Style,
  Theme,
} from "./types.ts";
export type * from "./types.ts";
import { compatibilitySchema, sourceSchema, themeSchema, validateSchema } from "./schema.ts";
import {
  implementationCandidates,
  implementationImports,
  themeDeclarations,
  themeEditableTokens,
} from "./source-parser.ts";
export { validateCompatibility } from "./schema.ts";

export const CONTRACT_FORMAT_VERSION = 3;
export const DOCS_INDEX_FORMAT_VERSION = 1;

export const contractSchema: Schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "sources",
    "theme",
    "formatVersion",
    "lensoVersion",
    "packageVersions",
    "compatibility",
    "api",
    "docs",
    "examples",
    "styles",
    "markdownLinePool",
    "sourceFilePool",
    "digest",
  ],
  properties: {
    formatVersion: { const: CONTRACT_FORMAT_VERSION },
    lensoVersion: { type: "string", minLength: 1 },
    packageVersions: {
      type: "object",
      minProperties: 1,
      required: ["@lenso/ui", "@lenso/tokens"],
      additionalProperties: { type: "string", minLength: 1 },
    },
    compatibility: compatibilitySchema,
    sources: sourceSchema,
    theme: themeSchema,
    api: {
      type: "object",
      additionalProperties: false,
      required: ["upstream", "properties", "families"],
      properties: {
        upstream: { type: "object" },
        properties: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "type",
              "expandedType",
              "required",
              "description",
              "source",
              "default",
            ],
            properties: {
              name: { type: "string", minLength: 1 },
              type: { type: "string" },
              expandedType: { type: "string" },
              required: { type: "boolean" },
              description: { type: "string" },
              source: {
                type: "object",
                additionalProperties: false,
                required: ["path", "line"],
                properties: {
                  path: { type: "string", minLength: 1 },
                  line: { type: "integer", minimum: 1 },
                },
              },
              default: { type: ["string", "null"] },
            },
          },
        },
        families: {
          type: "object",
          minProperties: 1,
          additionalProperties: {
            type: "object",
            additionalProperties: false,
            required: ["parts"],
            properties: {
              parts: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "name",
                    "signature",
                    "props",
                    "source",
                    "native",
                    "members",
                    "states",
                    "properties",
                  ],
                  properties: {
                    name: { type: "string", minLength: 1 },
                    signature: { type: "string" },
                    props: { type: ["string", "null"] },
                    source: {
                      type: "object",
                      additionalProperties: false,
                      required: ["path", "line"],
                      properties: {
                        path: { type: "string", minLength: 1 },
                        line: { type: "integer", minimum: 1 },
                      },
                    },
                    native: { type: "array", items: { type: "string" } },
                    members: { type: "array", items: { type: "string" } },
                    states: {
                      type: "object",
                      additionalProperties: {
                        type: "array",
                        minItems: 1,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          required: ["name", "type", "required"],
                          properties: {
                            name: { type: "string", minLength: 1 },
                            type: { type: "string" },
                            required: { type: "boolean" },
                          },
                        },
                      },
                    },
                    properties: {
                      type: "array",
                      minItems: 1,
                      items: { type: "integer", minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    docs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["locale", "slug", "title", "description", "markdownLineRefs"],
        properties: {
          locale: { type: "string", minLength: 1 },
          slug: { type: "string", minLength: 1 },
          title: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 1 },
          markdownLineRefs: { type: "array", items: { type: "integer", minimum: 0 } },
        },
      },
    },
    examples: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "locale", "file", "codeRef", "helperFileRefs"],
        properties: {
          name: { type: "string", minLength: 1 },
          locale: { type: "string", minLength: 1 },
          file: { type: "string", minLength: 1 },
          codeRef: { type: "integer", minimum: 0 },
          helperFileRefs: { type: "array", items: { type: "integer", minimum: 0 } },
        },
      },
    },
    styles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["family", "file", "codeRef"],
        properties: {
          family: { type: "string", minLength: 1 },
          file: { type: "string", minLength: 1 },
          codeRef: { type: "integer", minimum: 0 },
        },
      },
    },
    markdownLinePool: { type: "array", items: { type: "string" } },
    sourceFilePool: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["file", "code"],
        properties: {
          file: { type: "string", minLength: 1 },
          code: { type: "string" },
        },
      },
    },
    digest: { type: "string", pattern: "^[a-f0-9]{64}$" },
  },
};

export function canonicalSerialize(value: unknown): string {
  const ancestors = new Set<object>();
  const serialize = (item: unknown): string => {
    if (item === null || typeof item === "string" || typeof item === "boolean") {
      return JSON.stringify(item);
    }
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw new TypeError("Cannot canonicalize non-finite number");
      return JSON.stringify(item);
    }
    if (typeof item !== "object") throw new TypeError(`Cannot canonicalize ${typeof item}`);
    if (ancestors.has(item)) throw new TypeError("Cannot canonicalize cyclic value");
    ancestors.add(item);
    let result;
    if (Array.isArray(item)) {
      const values: string[] = [];
      for (let index = 0; index < item.length; index += 1) {
        if (!Object.hasOwn(item, index)) throw new TypeError("Cannot canonicalize sparse array");
        values.push(serialize(item[index]));
      }
      if (
        Reflect.ownKeys(item).some(
          (key) => typeof key !== "string" || (key !== "length" && !/^(0|[1-9]\d*)$/.test(key)),
        )
      ) {
        throw new TypeError("Cannot canonicalize array with extra properties");
      }
      result = `[${values.join(",")}]`;
    } else {
      if (
        Object.getPrototypeOf(item) !== Object.prototype &&
        Object.getPrototypeOf(item) !== null
      ) {
        throw new TypeError("Cannot canonicalize non-plain object");
      }
      const keys = Reflect.ownKeys(item);
      if (keys.some((key) => typeof key !== "string")) {
        throw new TypeError("Cannot canonicalize symbol keys");
      }
      result = `{${keys
        .map(String)
        .sort()
        .map((key) => {
          const descriptor = Object.getOwnPropertyDescriptor(item, key);
          if (!descriptor || !("value" in descriptor)) {
            throw new TypeError("Cannot canonicalize accessor properties");
          }
          return `${JSON.stringify(key)}:${serialize(descriptor.value)}`;
        })
        .join(",")}}`;
    }
    ancestors.delete(item);
    return result;
  };
  return serialize(value);
}

export function contractDigest(contract: object): string {
  assertObject(contract, "contract");
  const { digest: _digest, ...payload } = contract;
  return createHash("sha256").update(canonicalSerialize(payload)).digest("hex");
}

const fail = (message: string): never => {
  throw new TypeError(`Invalid Lenso contract: ${message}`);
};

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label} must be an object`);
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be a non-empty string`);
}

function validateSource(source: Provenance, label: string) {
  assertObject(source, label);
  assertString(source.path, `${label} path`);
  if (!Number.isInteger(source.line) || source.line < 1) {
    fail(`${label} line must be a positive integer`);
  }
}

export function validateExamplePath(file: string, root?: string): string {
  assertString(file, "example file");
  const segments = file.split(/[\\/]/);
  if (
    file.startsWith("/") ||
    file.startsWith("\\") ||
    /^[a-zA-Z]:/.test(file) ||
    file.includes("\0") ||
    file.includes("\\") ||
    segments.some((segment) => segment === ".." || segment === "." || segment === "")
  ) {
    fail(`example path escapes its root: ${file}`);
  }
  if (root) {
    const base = realpathSync(root);
    let cursor = resolve(root);
    for (const segment of segments) {
      cursor = resolve(cursor, segment);
      if (lstatSync(cursor).isSymbolicLink())
        fail(`example path escapes its root through a symlink: ${file}`);
    }
    let target: string;
    try {
      target = realpathSync(resolve(base, file));
    } catch {
      throw new TypeError(`Invalid Lenso contract: example file does not exist: ${file}`);
    }
    if (target !== base && !target.startsWith(`${base}${sep}`)) {
      fail(`example path escapes its root: ${file}`);
    }
  }
  return file;
}

function ensureUnique<T>(items: T[], key: (item: T) => string | number, label: string) {
  const seen = new Set();
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) fail(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function splitMarkdownLines(markdown: string): string[] {
  const lines = [];
  let start = 0;
  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] === "\r") {
      const end = markdown[index + 1] === "\n" ? index + 2 : index + 1;
      lines.push(markdown.slice(start, end));
      start = end;
      index = end - 1;
    } else if (markdown[index] === "\n") {
      lines.push(markdown.slice(start, index + 1));
      start = index + 1;
    }
  }
  if (start < markdown.length) lines.push(markdown.slice(start));
  return lines;
}

function encodeContractContent(
  docs: Doc[],
  examples: Example[],
  styles: Style[],
  sources: Source[],
  theme: Theme,
  { examplesRoot, stylesRoot }: Pick<ContractInputs, "examplesRoot" | "stylesRoot">,
) {
  const markdownLinePool: string[] = [];
  const markdownLineIds = new Map<string, number>();
  const internMarkdownLine = (line: string): number => {
    if (!markdownLineIds.has(line)) {
      markdownLineIds.set(line, markdownLinePool.length);
      markdownLinePool.push(line);
    }
    return markdownLineIds.get(line)!;
  };
  const sourceFilePool: SourceFile[] = [];
  const sourceFileIds = new Map<string, number>();
  const internSourceFile = (file: string, code: string, root?: string): number => {
    validateExamplePath(file, root);
    if (typeof code !== "string") fail(`source file code missing for ${file}`);
    const existing = sourceFileIds.get(file);
    if (existing !== undefined) {
      if (sourceFilePool[existing]!.code !== code) fail(`conflicting source file code for ${file}`);
      return existing;
    }
    const id = sourceFilePool.length;
    sourceFileIds.set(file, id);
    sourceFilePool.push({ file, code });
    return id;
  };
  return {
    docs: docs.map(({ locale, slug, title, description, markdown }) => {
      if (typeof markdown !== "string") fail(`markdown missing for ${locale}/${slug}`);
      return {
        locale,
        slug,
        title,
        description,
        markdownLineRefs: splitMarkdownLines(markdown).map(internMarkdownLine),
      };
    }),
    examples: examples.map(({ name, locale, file, code, files = [] }) => ({
      name,
      locale,
      file,
      codeRef: internSourceFile(file, code, examplesRoot),
      helperFileRefs: files.map(({ file: helperFile, code: helperCode }) =>
        internSourceFile(helperFile, helperCode, examplesRoot),
      ),
    })),
    styles: styles.map(({ family, file, code }) => ({
      family,
      file,
      codeRef: internSourceFile(file, code, stylesRoot),
    })),
    sources: sources.map(({ family, file, code, files }) => ({
      family,
      file,
      codeRef: internSourceFile(file, code, stylesRoot),
      helperFileRefs: files.map((helper) => internSourceFile(helper.file, helper.code, stylesRoot)),
    })),
    theme: {
      fileRefs: theme.files.map((file) => internSourceFile(file.file, file.code, stylesRoot)),
      declarations: structuredClone(theme.declarations),
      editableTokens: structuredClone(theme.editableTokens),
      editorSourceRef: internSourceFile(
        theme.editorSource.file,
        theme.editorSource.code,
        stylesRoot,
      ),
    },
    markdownLinePool,
    sourceFilePool,
  };
}

const supportedLocales = new Set(["en", "cn"]);

function assertKnownLocale(locale: string, label: string) {
  assertString(locale, label);
  if (!supportedLocales.has(locale)) fail(`unsupported locale ${locale}`);
}

function validateApi(api: ApiReference) {
  assertObject(api, "api");
  assertObject(api.upstream, "api.upstream");
  if (!Array.isArray(api.properties)) fail("api.properties must be an array");
  for (const [index, property] of api.properties.entries()) {
    assertObject(property, `api property ${index}`);
    assertString(property.name, `api property ${index} name`);
    if (typeof property.type !== "string") fail(`api property ${index} type must be a string`);
    if (typeof property.expandedType !== "string") {
      fail(`api property ${index} expandedType must be a string`);
    }
    if (typeof property.required !== "boolean") {
      fail(`api property ${index} required must be a boolean`);
    }
    if (typeof property.description !== "string") {
      fail(`api property ${index} description must be a string`);
    }
    validateSource(property.source, `api property ${index} source`);
    if (property.default !== null && typeof property.default !== "string") {
      fail(`api property ${index} default must be a string or null`);
    }
  }
  assertObject(api.families, "api.families");
  if (Object.keys(api.families).length === 0) fail("api.families must not be empty");
  if (Object.hasOwn(api.families, "dropdown") || Object.hasOwn(api.families, "publicDropdown")) {
    fail("API contains the retired public Dropdown family");
  }
  for (const [family, details] of Object.entries(api.families)) {
    assertString(family, "API family");
    assertObject(details, `API family ${family}`);
    if (!Array.isArray(details.parts) || details.parts.length === 0) {
      fail(`API family ${family} must have component parts`);
    }
    for (const [index, part] of details.parts.entries()) {
      const label = `API family ${family} part ${index}`;
      assertObject(part, label);
      assertString(part.name, `${label} name`);
      if (typeof part.signature !== "string") fail(`${label} signature must be a string`);
      if (part.props !== null && typeof part.props !== "string") {
        fail(`${label} props must be a string or null`);
      }
      validateSource(part.source, `${label} source`);
      for (const field of ["native", "members"] as const) {
        if (!Array.isArray(part[field]) || part[field].some((value) => typeof value !== "string")) {
          fail(`${label} ${field} must be an array of strings`);
        }
      }
      assertObject(part.states, `${label} states`);
      for (const [stateName, stateFields] of Object.entries(part.states)) {
        assertString(stateName, `${label} state name`);
        if (!Array.isArray(stateFields) || stateFields.length === 0) {
          fail(`${label} state ${stateName} must have fields`);
        }
        for (const [stateIndex, stateField] of stateFields.entries()) {
          const stateLabel = `${label} state ${stateName} field ${stateIndex}`;
          assertObject(stateField, stateLabel);
          assertString(stateField.name, `${stateLabel} name`);
          if (typeof stateField.type !== "string") fail(`${stateLabel} type must be a string`);
          if (typeof stateField.required !== "boolean") {
            fail(`${stateLabel} required must be a boolean`);
          }
        }
      }
      if (!Array.isArray(part.properties) || part.properties.length === 0) {
        fail(`${label} properties must be a non-empty array`);
      }
      for (const propertyId of part.properties) {
        if (
          !Number.isInteger(propertyId) ||
          propertyId < 0 ||
          propertyId >= api.properties.length
        ) {
          fail(`${label} has invalid property ID ${propertyId}`);
        }
      }
    }
  }
}

function validateDocShape(
  doc: DocMetadata & { navigationGroup?: string; navigationOrder?: number },
  label: string,
  { indexPage = false, encoded = false } = {},
) {
  assertObject(doc, label);
  const fields = indexPage
    ? [
        "locale",
        "slug",
        "title",
        "description",
        "markdownFile",
        "examples",
        "navigationGroup",
        "navigationOrder",
      ]
    : encoded
      ? ["locale", "slug", "title", "description", "markdownLineRefs"]
      : ["locale", "slug", "title", "description", "markdown"];
  for (const key of Object.keys(doc)) {
    if (!fields.includes(key)) {
      fail(`unknown ${label} field: ${key}`);
    }
  }
  assertKnownLocale(doc.locale, `${label} locale`);
  assertString(doc.slug, `${label} slug`);
  assertString(doc.title, `${label} title`);
  assertString(doc.description, `${label} description`);
  if (indexPage && (doc.navigationGroup !== undefined || doc.navigationOrder !== undefined)) {
    assertString(doc.navigationGroup, `${label} navigationGroup`);
    if (
      typeof doc.navigationOrder !== "number" ||
      !Number.isInteger(doc.navigationOrder) ||
      doc.navigationOrder < 0
    )
      fail(`${label} navigationOrder must be a nonnegative integer`);
  }
}

export function validateDocsIndex(index: DocsIndex, apiReference: ApiReference): DocsIndex {
  if (index.formatVersion !== DOCS_INDEX_FORMAT_VERSION) {
    fail("unsupported docs index formatVersion");
  }
  assertString(index.lensoVersion, "docs index lensoVersion");
  if (!Array.isArray(index.pages)) fail("docs index pages must be an array");
  assertObject(index.sourceFamilyMapping, "docs index sourceFamilyMapping");
  for (const [sourceName, publicName] of Object.entries(index.sourceFamilyMapping)) {
    assertString(sourceName, "source family name");
    assertString(publicName, `mapping for ${sourceName}`);
    if (
      publicName === "dropdown" ||
      publicName === "publicDropdown" ||
      !Object.hasOwn(apiReference.families, publicName)
    ) {
      fail(`source family ${sourceName} maps to unknown public family ${publicName}`);
    }
    if (sourceName !== "dropdown" && !Object.hasOwn(apiReference.families, sourceName)) {
      fail(`unknown source family mapping ${sourceName}`);
    }
    if (sourceName === "dropdown" && publicName !== "menu") {
      fail("the source Dropdown family must map to public Menu");
    }
  }
  for (const page of index.pages) {
    validateDocShape(page, "docs index page", { indexPage: true });
    assertString(page.markdownFile, `markdownFile for ${page.slug}`);
    if (
      page.markdownFile.startsWith("/") ||
      page.markdownFile.startsWith("\\") ||
      /^[a-zA-Z]:/.test(page.markdownFile) ||
      page.markdownFile.includes("\0") ||
      page.markdownFile.split(/[\\/]/).some((part) => part === ".." || part === "." || part === "")
    ) {
      fail(`markdownFile escapes docs root: ${page.markdownFile}`);
    }
    if (page.examples !== undefined && !Array.isArray(page.examples)) {
      fail(`examples must be an array for ${page.slug}`);
    }
    for (const example of page.examples ?? []) {
      assertObject(example, `indexed example on ${page.slug}`);
      assertString(example.name, "indexed example name");
      validateExamplePath(example.file);
    }
  }
  ensureUnique(index.pages, (page) => `${page.locale}/${page.slug}`, "docs index page");

  const pagesBySlug = new Map(index.pages.map((page) => [page.slug.split("/").at(-1), page]));
  for (const family of Object.keys(apiReference.families)) {
    const publicName = index.sourceFamilyMapping[family] ?? family;
    if (!pagesBySlug.has(publicName)) fail(`API family ${publicName} has no associated docs page`);
  }
  return index;
}

function validateContractShape(contract: LensoContract) {
  const allowed = new Set([
    "sources",
    "theme",
    "formatVersion",
    "lensoVersion",
    "packageVersions",
    "compatibility",
    "api",
    "docs",
    "examples",
    "styles",
    "markdownLinePool",
    "sourceFilePool",
    "digest",
  ]);
  for (const key of Object.keys(contract)) {
    if (!allowed.has(key)) fail(`unknown contract field: ${key}`);
  }
  if (contract.formatVersion !== CONTRACT_FORMAT_VERSION) fail("unsupported formatVersion");
  assertString(contract.lensoVersion, "lensoVersion");
  assertObject(contract.packageVersions, "packageVersions");
  if (Object.keys(contract.packageVersions).length === 0) fail("packageVersions must not be empty");
  for (const [name, version] of Object.entries(contract.packageVersions)) {
    assertString(name, "package name");
    assertString(version, `version for ${name}`);
  }
  if (
    contract.packageVersions["@lenso/ui"] !== contract.lensoVersion ||
    contract.packageVersions["@lenso/tokens"] !== contract.lensoVersion
  ) {
    fail("UI and tokens versions do not match lensoVersion");
  }
  assertObject(contract.compatibility, "compatibility");
  if (Object.keys(contract.compatibility).length === 0) {
    fail("compatibility must contain a source support descriptor");
  }
  validateApi(contract.api);
  if (!Array.isArray(contract.docs) || !Array.isArray(contract.examples))
    fail("docs and examples must be arrays");
  if (!Array.isArray(contract.markdownLinePool) || !Array.isArray(contract.sourceFilePool)) {
    fail("contract content pools must be arrays");
  }
  for (const line of contract.markdownLinePool) {
    if (typeof line !== "string") fail("markdown line pool entries must be strings");
  }
  ensureUnique(contract.markdownLinePool, (line) => line, "markdown pool line");
  for (const [index, file] of contract.sourceFilePool.entries()) {
    assertObject(file, `source file ${index}`);
    if (Object.keys(file).some((key) => !["file", "code"].includes(key))) {
      fail(`unknown source file field at index ${index}`);
    }
    validateExamplePath(file.file);
    if (typeof file.code !== "string") fail(`source file code missing for ${file.file}`);
  }
  ensureUnique(contract.sourceFilePool, (file) => file.file, "source file");
  const markdownRefs = new Set();
  for (const doc of contract.docs) {
    validateDocShape(doc, "document", { encoded: true });
    if (!Array.isArray(doc.markdownLineRefs)) {
      fail(`markdownLineRefs missing for ${doc.locale}/${doc.slug}`);
    }
    for (const ref of doc.markdownLineRefs) {
      assertReference(ref, contract.markdownLinePool.length, `markdown line in ${doc.slug}`);
      markdownRefs.add(ref);
    }
  }
  ensureUnique(contract.docs, (doc) => `${doc.locale}/${doc.slug}`, "document");
  const apiFamilies = new Set(Object.keys(contract.api.families));
  const docFamilySlugs = new Set(
    contract.docs.map((doc) => doc.slug.split("/").at(-1)!).filter((slug) => apiFamilies.has(slug)),
  );
  for (const family of apiFamilies) {
    if (!docFamilySlugs.has(family)) fail(`API family ${family} has no associated document`);
  }
  for (const doc of contract.docs) {
    if (doc.slug.startsWith("components/") && !apiFamilies.has(doc.slug.split("/").at(-1)!)) {
      fail(`unknown component document ${doc.slug}`);
    }
  }
  const sourceRefs = new Set();
  for (const example of contract.examples) {
    assertObject(example, "example");
    if (
      Object.keys(example).some(
        (key) => !["name", "locale", "file", "codeRef", "helperFileRefs"].includes(key),
      )
    ) {
      fail("unknown encoded example field");
    }
    assertString(example.name, "example name");
    assertKnownLocale(example.locale, "example locale");
    validateExamplePath(example.file);
    assertReference(example.codeRef, contract.sourceFilePool.length, `code for ${example.name}`);
    sourceRefs.add(example.codeRef);
    if (contract.sourceFilePool[example.codeRef]!.file !== example.file) {
      fail(`example path and source file reference differ for ${example.name}`);
    }
    if (!Array.isArray(example.helperFileRefs)) {
      fail(`helperFileRefs must be an array for ${example.name}`);
    }
    const helperPaths = [];
    for (const ref of example.helperFileRefs) {
      assertReference(ref, contract.sourceFilePool.length, `helper file in ${example.name}`);
      sourceRefs.add(ref);
      helperPaths.push(contract.sourceFilePool[ref]!.file);
    }
    ensureUnique(helperPaths, (file) => file, `helper file in ${example.name}`);
    if (helperPaths.includes(example.file))
      fail(`example ${example.name} lists its source as a helper`);
  }
  ensureUnique(contract.examples, (example) => `${example.locale}/${example.name}`, "example");
  const familyNames = contract.api.families;
  if (!Array.isArray(contract.styles)) fail("styles must be an array");
  for (const style of contract.styles) {
    assertObject(style, "encoded style");
    if (Object.keys(style).some((key) => !["family", "file", "codeRef"].includes(key))) {
      fail("unknown encoded style field");
    }
    assertString(style.family, "style family");
    assertString(style.file, "style file");
    if (!Object.hasOwn(familyNames, style.family)) fail(`unknown style family ${style.family}`);
    validateExamplePath(style.file);
    assertReference(
      style.codeRef,
      contract.sourceFilePool.length,
      `style code for ${style.family}`,
    );
    sourceRefs.add(style.codeRef);
    if (contract.sourceFilePool[style.codeRef]!.file !== style.file) {
      fail(`style path and source file reference differ for ${style.family}`);
    }
  }
  ensureUnique(
    contract.styles,
    (style) => `${style.family}/${style.file}`,
    "style family and file",
  );
  ensureUnique(contract.sources, (source) => source.family, "source family");
  if (contract.sources.length !== Object.keys(familyNames).length)
    fail("sources must cover every API family");
  const parsedImports = new Map<number, string[]>();
  for (const source of contract.sources) {
    const family = familyNames[source.family];
    if (!family)
      throw new TypeError(`Invalid Lenso contract: unknown source family ${source.family}`);
    if (implementationRoot(source.family, family) !== source.file)
      fail(`source root differs from API provenance for ${source.family}`);
    const refs = [source.codeRef, ...source.helperFileRefs];
    ensureUnique(refs, (ref) => ref, `source file in ${source.family}`);
    const graphPaths = new Set<string>();
    for (const ref of refs) {
      assertReference(ref, contract.sourceFilePool.length, "implementation source");
      sourceRefs.add(ref);
      validateRepositoryPath(contract.sourceFilePool[ref]!.file, "packages/react/src/");
      graphPaths.add(contract.sourceFilePool[ref]!.file);
    }
    for (const ref of refs) {
      const file = contract.sourceFilePool[ref]!;
      let imports = parsedImports.get(ref);
      if (!imports) {
        imports = implementationImports(file);
        parsedImports.set(ref, imports);
      }
      for (const specifier of imports)
        if (
          !implementationCandidates(file.file, specifier).some((candidate) =>
            graphPaths.has(candidate),
          )
        )
          fail(`missing local implementation helper: ${specifier} imported by ${file.file}`);
    }
    for (const part of family.parts)
      if (!graphPaths.has(part.source.path))
        fail(`missing API implementation file for ${source.family}: ${part.source.path}`);
    if (contract.sourceFilePool[source.codeRef]!.file !== source.file)
      fail("implementation source reference mismatch");
  }
  ensureUnique(contract.theme.fileRefs, (ref) => ref, "theme file");
  const themePaths = new Set<string>();
  for (const ref of contract.theme.fileRefs) {
    assertReference(ref, contract.sourceFilePool.length, "theme source");
    sourceRefs.add(ref);
    const file = contract.sourceFilePool[ref]!.file;
    validateRepositoryPath(file, "packages/styles/themes/");
    if (!file.endsWith(".css")) fail("theme source must be CSS");
    themePaths.add(file);
  }
  assertReference(
    contract.theme.editorSourceRef,
    contract.sourceFilePool.length,
    "theme editor source",
  );
  sourceRefs.add(contract.theme.editorSourceRef);
  if (
    contract.sourceFilePool[contract.theme.editorSourceRef]!.file !== "packages/styles/src/theme.ts"
  )
    fail("invalid editable theme source");
  ensureUnique(contract.theme.editableTokens, (token) => token.key, "editable theme token");
  const declarations = contract.theme.fileRefs.flatMap((ref) =>
    themeDeclarations(contract.sourceFilePool[ref]!),
  );
  if (
    !declarations.length ||
    canonicalSerialize(declarations) !== canonicalSerialize(contract.theme.declarations)
  )
    fail("theme declarations differ from included CSS");
  const editableTokens = themeEditableTokens(
    contract.sourceFilePool[contract.theme.editorSourceRef]!,
  );
  if (
    !editableTokens.length ||
    canonicalSerialize(editableTokens) !== canonicalSerialize(contract.theme.editableTokens)
  )
    fail("editable theme tokens differ from included editor source");
  for (const declaration of contract.theme.declarations) {
    if (!themePaths.has(declaration.file))
      fail(`theme declaration has no source file: ${declaration.file}`);
  }
  if (sourceRefs.size !== contract.sourceFilePool.length)
    fail("unreferenced source file pool entry");
  if (markdownRefs.size !== contract.markdownLinePool.length) {
    fail("unreferenced markdown line pool entry");
  }
}

function assertReference(reference: number, length: number, label: string) {
  if (!Number.isInteger(reference) || reference < 0 || reference >= length) {
    fail(`invalid ${label} reference ${reference}`);
  }
}

function validateStyles(styles: Style[], families: Record<string, ApiFamily>, root?: string) {
  if (!Array.isArray(styles)) fail("styles must be an array");
  for (const style of styles) {
    assertObject(style, "style");
    if (Object.keys(style).some((key) => !["family", "file", "code"].includes(key))) {
      fail("unknown style field");
    }
    assertString(style.family, "style family");
    assertString(style.file, "style file");
    if (!Object.hasOwn(families, style.family)) fail(`unknown style family ${style.family}`);
    validateExamplePath(style.file, root);
    if (typeof style.code !== "string") fail(`style code missing for ${style.family}`);
  }
  ensureUnique(styles, (style) => `${style.family}/${style.file}`, "style family and file");
}

export function buildLensoContract(input: ContractInputs): LensoContract {
  assertObject(input, "input");
  const {
    apiReference,
    docsIndex,
    packageVersions,
    compatibility,
    docs,
    examples,
    styles = [],
    sources,
    theme,
    examplesRoot,
    stylesRoot,
  } = input;
  assertObject(apiReference, "apiReference");
  assertObject(docsIndex, "docsIndex");
  validateApi(apiReference);
  validateDocsIndex(docsIndex, apiReference);
  assertObject(packageVersions, "packageVersions");
  assertObject(compatibility, "compatibility");
  validateStyles(styles, apiReference.families, stylesRoot);
  if (!Array.isArray(docs) || !Array.isArray(examples)) fail("docs and examples must be arrays");
  const uiVersion = packageVersions["@lenso/ui"];
  const tokensVersion = packageVersions["@lenso/tokens"];
  if (!uiVersion || uiVersion !== tokensVersion || uiVersion !== docsIndex.lensoVersion) {
    fail("UI, tokens, docs index, and contract versions must match");
  }
  const locales = new Set(docsIndex.pages.map((page) => page.locale));
  const indexedPages = new Map(
    docsIndex.pages.map((page) => [`${page.locale}/${page.slug}`, page]),
  );
  ensureUnique(docsIndex.pages, (page) => `${page.locale}/${page.slug}`, "docs index page");
  ensureUnique(docs, (page) => `${page.locale}/${page.slug}`, "document");
  ensureUnique(examples, (example) => `${example.locale}/${example.name}`, "example");
  if (docs.length !== docsIndex.pages.length) fail("docs do not cover every indexed page");
  for (const doc of docs) {
    validateDocShape(doc, "document");
    if (typeof doc.markdown !== "string") fail(`markdown missing for ${doc.locale}/${doc.slug}`);
    if (!locales.has(doc.locale) || !indexedPages.has(`${doc.locale}/${doc.slug}`)) {
      fail(`unknown document ${doc.locale}/${doc.slug}`);
    }
  }
  const indexedExamples = new Set();
  const indexedExampleFiles = new Map();
  for (const page of docsIndex.pages) {
    for (const example of page.examples ?? []) {
      const key = `${page.locale}/${example.name}`;
      indexedExamples.add(key);
      if (indexedExampleFiles.has(key)) fail(`duplicate indexed example: ${key}`);
      indexedExampleFiles.set(key, example.file);
    }
  }
  for (const example of examples) {
    assertKnownLocale(example.locale, "example locale");
    assertString(example.name, "example name");
    validateExamplePath(example.file, examplesRoot);
    if (!locales.has(example.locale) || !indexedExamples.has(`${example.locale}/${example.name}`)) {
      fail(`unknown example ${example.locale}/${example.name}`);
    }
    if (indexedExampleFiles.get(`${example.locale}/${example.name}`) !== example.file) {
      fail(`example file does not match docs index for ${example.locale}/${example.name}`);
    }
    if (typeof example.code !== "string") fail(`example code missing for ${example.name}`);
    if (example.files !== undefined && !Array.isArray(example.files))
      fail(`files must be an array for ${example.name}`);
    for (const file of example.files ?? []) {
      validateExamplePath(file.file, examplesRoot);
      if (typeof file.code !== "string") fail(`file code missing for ${file.file}`);
    }
  }
  if (
    examples.length !== indexedExamples.size ||
    [...indexedExamples].some(
      (key) => !examples.some((example) => `${example.locale}/${example.name}` === key),
    )
  ) {
    fail("examples do not cover every indexed example");
  }
  const encodedContent = encodeContractContent(docs, examples, styles, sources, theme, {
    examplesRoot,
    stylesRoot,
  });
  const contract: LensoContract = {
    formatVersion: CONTRACT_FORMAT_VERSION,
    lensoVersion: docsIndex.lensoVersion,
    packageVersions: structuredClone(packageVersions),
    compatibility: structuredClone(compatibility),
    api: structuredClone(apiReference),
    ...encodedContent,
    digest: "",
  };
  contract.digest = contractDigest(contract);
  return validateContract(contract);
}

export function validateContract(input: unknown): LensoContract {
  validateSchema(input, contractSchema, "contract");
  const contract = input as LensoContract;
  if (typeof contract.digest !== "string" || contract.digest !== contractDigest(contract)) {
    fail("digest mismatch");
  }
  validateContractShape(contract);
  if (
    contract.packageVersions?.["@lenso/ui"] !== contract.lensoVersion ||
    contract.packageVersions?.["@lenso/tokens"] !== contract.lensoVersion
  ) {
    fail("UI and tokens versions do not match lensoVersion");
  }
  return contract;
}

function assertResolverInput<T>(
  contract: LensoContract,
  encodedRecord: T,
  records: T[],
  label: string,
) {
  assertObject(contract, "contract");
  if (contract.formatVersion !== CONTRACT_FORMAT_VERSION) {
    fail(`unsupported formatVersion for ${label} resolver`);
  }
  if (!records.includes(encodedRecord)) fail(`${label} record does not belong to this contract`);
}

function resolveSourceFile(contract: LensoContract, reference: number, label: string): SourceFile {
  assertReference(reference, contract.sourceFilePool?.length ?? 0, label);
  return contract.sourceFilePool[reference]!;
}

export function resolveDoc(contract: LensoContract, encodedDocRecord: EncodedDoc): Doc {
  assertResolverInput(contract, encodedDocRecord, contract.docs ?? [], "document");
  if (!Array.isArray(encodedDocRecord.markdownLineRefs)) {
    fail("encoded document has no markdownLineRefs");
  }
  const markdown = encodedDocRecord.markdownLineRefs
    .map((reference) => {
      assertReference(reference, contract.markdownLinePool?.length ?? 0, "markdown line");
      return contract.markdownLinePool[reference];
    })
    .join("");
  return {
    locale: encodedDocRecord.locale,
    slug: encodedDocRecord.slug,
    title: encodedDocRecord.title,
    description: encodedDocRecord.description,
    markdown,
  };
}

export function resolveExample(
  contract: LensoContract,
  encodedExampleRecord: EncodedExample,
): Example {
  assertResolverInput(contract, encodedExampleRecord, contract.examples ?? [], "example");
  const source = resolveSourceFile(contract, encodedExampleRecord.codeRef, "example source file");
  if (source.file !== encodedExampleRecord.file) fail("example source file reference mismatch");
  if (!Array.isArray(encodedExampleRecord.helperFileRefs)) {
    fail("encoded example has no helperFileRefs");
  }
  return {
    name: encodedExampleRecord.name,
    locale: encodedExampleRecord.locale,
    file: source.file,
    code: source.code,
    files: encodedExampleRecord.helperFileRefs.map((reference) => {
      const helper = resolveSourceFile(contract, reference, "example helper file");
      return { file: helper.file, code: helper.code };
    }),
  };
}

export function resolveStyle(contract: LensoContract, encodedStyleRecord: EncodedStyle): Style {
  assertResolverInput(contract, encodedStyleRecord, contract.styles ?? [], "style");
  const source = resolveSourceFile(contract, encodedStyleRecord.codeRef, "style source file");
  if (source.file !== encodedStyleRecord.file) fail("style source file reference mismatch");
  return { family: encodedStyleRecord.family, file: source.file, code: source.code };
}

export function resolveSource(contract: LensoContract, record: EncodedSource): Source {
  assertResolverInput(contract, record, contract.sources, "implementation");
  const source = resolveSourceFile(contract, record.codeRef, "implementation source");
  if (source.file !== record.file) fail("implementation source reference mismatch");
  return {
    family: record.family,
    ...source,
    files: record.helperFileRefs.map((ref) =>
      resolveSourceFile(contract, ref, "implementation helper"),
    ),
  };
}

export function resolveTheme(contract: LensoContract): Theme {
  return {
    files: contract.theme.fileRefs.map((ref) => resolveSourceFile(contract, ref, "theme source")),
    declarations: contract.theme.declarations,
    editableTokens: contract.theme.editableTokens,
    editorSource: resolveSourceFile(
      contract,
      contract.theme.editorSourceRef,
      "theme editor source",
    ),
  };
}

export function validateRepositoryPath(file: string, prefix: string, root?: string): string {
  validateExamplePath(file);
  if (!file.startsWith(prefix)) fail(`source path is outside ${prefix}: ${file}`);
  if (root) validateExamplePath(file, root);
  return file;
}

/** Compound exports may originate in index.ts or reuse another family's parts. */
export function implementationRoot(family: string, api: ApiFamily): string {
  const prefix = `packages/react/src/components/${family}/`;
  const roots = [...new Set(api.parts.map((part) => part.source.path))].filter(
    (file) => file.startsWith(prefix) && !/\/index\.[cm]?tsx?$/.test(file),
  );
  if (roots.length !== 1) fail(`Expected one actual implementation root for ${family}`);
  return validateRepositoryPath(roots[0]!, prefix);
}

export function validateApiReference(input: unknown): ApiReference {
  validateSchema(input, contractSchema.properties!["api"]!, "api");
  const api = input as ApiReference;
  validateApi(api);
  return api;
}

export function readDocsIndex(input: unknown, api: ApiReference): DocsIndex {
  validateSchema(
    input,
    {
      type: "object",
      required: ["formatVersion", "lensoVersion", "sourceFamilyMapping", "pages"],
      properties: {
        formatVersion: { const: DOCS_INDEX_FORMAT_VERSION },
        lensoVersion: { type: "string", minLength: 1 },
        sourceFamilyMapping: {
          type: "object",
          additionalProperties: { type: "string", minLength: 1 },
        },
        pages: {
          type: "array",
          items: {
            type: "object",
            required: ["locale", "slug", "title", "description", "markdownFile", "examples"],
            properties: {
              locale: { type: "string" },
              slug: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              markdownFile: { type: "string" },
              navigationGroup: { type: "string" },
              navigationOrder: { type: "integer", minimum: 0 },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  required: ["name", "file"],
                  properties: { name: { type: "string" }, file: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "docs index",
  );
  return validateDocsIndex(input as DocsIndex, api);
}
