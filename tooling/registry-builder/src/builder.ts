import { createHash } from "node:crypto";
import path from "node:path";

export type RegistryItemType =
  | "registry:component"
  | "registry:lib"
  | "registry:style"
  | "registry:ui";

export interface RegistryItemSpecFile {
  source: string;
  target: string;
  type?: RegistryItemType;
}

export interface RegistryItemSpec {
  dependencies?: string[];
  files: RegistryItemSpecFile[];
  name: string;
  registryDependencies?: string[];
  title: string;
  type: RegistryItemType;
}

export interface BuiltRegistryFile {
  content: string;
  path: string;
  source: string;
  target: string;
  type: RegistryItemType;
}

export interface BuiltRegistryItem {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  dependencies?: string[];
  files: BuiltRegistryFile[];
  name: string;
  registryDependencies?: string[];
  title: string;
  type: RegistryItemType;
}

export interface PublicRegistryItem extends Omit<BuiltRegistryItem, "files"> {
  files: Array<Omit<BuiltRegistryFile, "source">>;
}

export type ReadTextFile = (absolutePath: string) => string;

export function buildRegistryItem(
  spec: RegistryItemSpec,
  repositoryRoot: string,
  readTextFile: ReadTextFile,
): BuiltRegistryItem {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...(spec.dependencies ? { dependencies: [...spec.dependencies].sort() } : {}),
    files: spec.files.map((file) => ({
      content: readTextFile(path.join(repositoryRoot, file.source)),
      path: file.target,
      source: file.source,
      target: file.target,
      type: file.type ?? spec.type,
    })),
    name: spec.name,
    ...(spec.registryDependencies
      ? { registryDependencies: [...spec.registryDependencies].sort() }
      : {}),
    title: spec.title,
    type: spec.type,
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createParityManifest(items: BuiltRegistryItem[], readSource: ReadTextFile) {
  return {
    algorithm: "sha256",
    items: Object.fromEntries(
      [...items]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => [
          item.name,
          {
            files: item.files.map((file) => {
              const sourceContent = readSource(file.source);
              const sourceSha256 = sha256(sourceContent);
              const registrySha256 = sha256(file.content);
              if (sourceSha256 !== registrySha256) {
                throw new Error(`Registry source parity failed for ${item.name}:${file.source}`);
              }
              return {
                registrySha256,
                source: file.source,
                sourceSha256,
                target: file.target,
              };
            }),
          },
        ]),
    ),
  } as const;
}

export function publicRegistryItem(item: BuiltRegistryItem): PublicRegistryItem {
  return {
    ...item,
    files: item.files.map(({ source: _source, ...file }) => file),
  };
}
