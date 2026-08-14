import { createHash } from "node:crypto";

import Ajv from "ajv";

import type { JsonDocumentMap, JsonObject, ResolverDocument } from "./generator.js";

interface SchemaLock {
  format: { sha256: string; url: string };
  resolver: { sha256: string; url: string };
}

function assertValid(label: string, validate: ReturnType<Ajv["compile"]>, value: unknown): void {
  if (validate(value)) return;
  const details = validate.errors
    ?.map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .join("; ");
  throw new Error(`${label} failed DTCG schema validation: ${details}`);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function validateDtcgSources({
  files,
  formatSchema,
  formatSchemaSource,
  lock,
  resolver,
  resolverSchema,
  resolverSchemaSource,
}: {
  files: JsonDocumentMap;
  formatSchema: JsonObject;
  formatSchemaSource: string;
  lock: SchemaLock;
  resolver: ResolverDocument;
  resolverSchema: JsonObject;
  resolverSchemaSource: string;
}): void {
  if (sha256(formatSchemaSource) !== lock.format.sha256) {
    throw new Error("Vendored DTCG Format schema does not match schemas/lock.json");
  }
  if (sha256(resolverSchemaSource) !== lock.resolver.sha256) {
    throw new Error("Vendored DTCG Resolver schema does not match schemas/lock.json");
  }

  const formatAjv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const resolverAjv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const validateFormat = formatAjv.compile(formatSchema);
  const validateResolver = resolverAjv.compile(resolverSchema);

  assertValid("lenso.resolver.json", validateResolver, resolver);
  for (const [file, document] of Object.entries(files).sort()) {
    assertValid(file, validateFormat, document);
  }
}
