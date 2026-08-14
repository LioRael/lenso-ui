import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  compileResolver,
  publicTokenPaths,
  renderTokenArtifacts,
  type JsonDocumentMap,
  type JsonObject,
  type ResolverDocument,
} from "./generator.js";
import { validateDtcgSources } from "./schema.js";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const sourceRoot = path.join(repositoryRoot, "packages/tokens/src");
const uiTokenBridge = path.join(repositoryRoot, "packages/ui/src/tokens.stylex.ts");
const registryTokenBridge = path.join(repositoryRoot, "registry/tokens.stylex.ts");

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(sourceRoot, relativePath), "utf8")) as T;
}

const resolver = await readJson<ResolverDocument>("lenso.resolver.json");
const sourcePaths = [
  "foundation.json",
  "semantic.json",
  "themes/light.json",
  "themes/dark.json",
] as const;
const files: JsonDocumentMap = Object.fromEntries(
  await Promise.all(
    sourcePaths.map(async (sourcePath) => [sourcePath, await readJson<JsonObject>(sourcePath)]),
  ),
);
const schemaRoot = path.resolve(import.meta.dirname, "../schemas");
const [formatSchemaSource, resolverSchemaSource, schemaLockSource] = await Promise.all([
  readFile(path.join(schemaRoot, "format.json"), "utf8"),
  readFile(path.join(schemaRoot, "resolver.json"), "utf8"),
  readFile(path.join(schemaRoot, "lock.json"), "utf8"),
]);
validateDtcgSources({
  files,
  formatSchema: JSON.parse(formatSchemaSource) as JsonObject,
  formatSchemaSource,
  lock: JSON.parse(schemaLockSource) as {
    format: { sha256: string; url: string };
    resolver: { sha256: string; url: string };
  },
  resolver,
  resolverSchema: JSON.parse(resolverSchemaSource) as JsonObject,
  resolverSchemaSource,
});
const publicRoots = ["color", "font", "opacity", "radius", "size", "space"];
const requiredSemanticPaths = publicTokenPaths(files["semantic.json"]!, publicRoots);
const ir = compileResolver(resolver, files, {
  publicRoots,
  requiredSemanticPaths,
});
const artifacts = renderTokenArtifacts(ir);

await Promise.all([
  writeFile(path.join(sourceRoot, "index.ts"), artifacts.typescript),
  writeFile(path.join(sourceRoot, "tokens.stylex.ts"), artifacts.stylex),
  writeFile(uiTokenBridge, artifacts.stylex),
  writeFile(registryTokenBridge, artifacts.stylex),
  writeFile(path.join(sourceRoot, "styles.css"), artifacts.css),
  writeFile(path.join(sourceRoot, "contract.json"), artifacts.contractJson),
  writeFile(path.join(sourceRoot, "tokens.json"), artifacts.dtcgJson),
  writeFile(path.join(sourceRoot, "figma-map.json"), artifacts.figmaManifestJson),
  writeFile(path.join(sourceRoot, "consumer-theme.ts.txt"), artifacts.adapter),
]);
