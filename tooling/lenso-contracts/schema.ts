import type { CompatibilityDescriptor, JsonValue, Schema } from "./types.ts";

const string: Schema = { type: "string", minLength: 1 };
const boolean: Schema = { type: "boolean" };
const reference: Schema = { type: "integer", minimum: 0 };
const array = (items: Schema): Schema => ({ type: "array", items });
const object = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});

export const sourceSchema = array(
  object({
    family: string,
    file: string,
    codeRef: reference,
    helperFileRefs: array(reference),
  }),
);
export const themeSchema = object({
  fileRefs: { ...array(reference), minItems: 1 },
  editorSourceRef: reference,
  declarations: array(
    object({
      file: string,
      scope: { ...array(string), minItems: 1 },
      name: { type: "string", pattern: "^--[a-zA-Z0-9_-]+$" },
      value: string,
    }),
  ),
  editableTokens: array(
    object({
      key: string,
      label: string,
      category: { enum: ["color", "length", "font-family"] },
    }),
  ),
});
export const compatibilitySchema = object({
  schemaVersion: { const: 1 },
  node: object({ range: string, testedVersion: string }),
  stylex: object({
    compiler: string,
    version: string,
    metadataFormat: string,
    metadataVersion: { type: "integer", minimum: 1 },
    compileMode: object({
      dev: boolean,
      styleResolution: string,
      classNamePrefix: string,
      runtimeInjection: boolean,
    }),
  }),
  next: object({
    version: string,
    router: string,
    bundler: string,
    customGlobalError: string,
    explicitCss: object({ api: string, mode: string, watch: boolean, cache: boolean }),
    legacyAssetRewrite: object({ customGlobalError: string, version: string }),
    unsupportedBundlers: array(string),
  }),
  vite: object({ testedVersion: string }),
});

/** Unknown JSON is checked before any public record cast. */
export function validateSchema(value: unknown, schema: Schema, label: string): void {
  const fail = (reason: string): never => {
    throw new TypeError(`Invalid Lenso contract: ${label}: ${reason}`);
  };
  if (schema.const !== undefined && value !== schema.const)
    fail("unsupported formatVersion or schemaVersion");
  if (schema.enum && !schema.enum.includes(value as JsonValue)) fail("unsupported value");
  const types = schema.type ? [schema.type].flat() : [];
  if (
    types.length &&
    !types.some((type) =>
      type === "null"
        ? value === null
        : type === "array"
          ? Array.isArray(value)
          : type === "object"
            ? value !== null && typeof value === "object" && !Array.isArray(value)
            : type === "integer"
              ? typeof value === "number" && Number.isInteger(value)
              : typeof value === type,
    )
  )
    fail(`expected ${types.join(" or ")}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail("empty string");
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail("invalid string");
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum)
    fail("below minimum");
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail("empty array");
    if (schema.items)
      value.forEach((item: unknown, index: number) =>
        validateSchema(item, schema.items!, `${label}[${index}]`),
      );
  } else if (value !== null && typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
      fail("must be a plain object");
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties)
      fail("empty object");
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      const child = schema.properties?.[key];
      if (child) validateSchema(item, child, `${label}.${key}`);
      else if (schema.additionalProperties === false) fail(`unknown field: ${key}`);
      else if (typeof schema.additionalProperties === "object")
        validateSchema(item, schema.additionalProperties, `${label}.${key}`);
    }
  }
}

export function validateCompatibility(input: unknown): CompatibilityDescriptor {
  validateSchema(input, compatibilitySchema, "compatibility");
  return input as CompatibilityDescriptor;
}
