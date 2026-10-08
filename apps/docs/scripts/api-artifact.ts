import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export async function fingerprint(
  directory: string,
  inputs: string[],
  excluded: string[] = [],
): Promise<string> {
  const hash = createHash("sha256");
  async function visit(relative: string): Promise<void> {
    if (excluded.includes(relative)) return;
    const absolute = path.join(directory, relative);
    let entries;
    try {
      entries = await readdir(absolute, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOTDIR") {
        hash
          .update(relative)
          .update("\0")
          .update(await readFile(absolute))
          .update("\0");
        return;
      }
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink())
        throw new Error(`Unexpected generation input symlink: ${relative}`);
      await visit(path.join(relative, entry.name));
    }
  }
  for (const input of inputs) await visit(input);
  return hash.digest("hex");
}

export async function apiSourceInputs(directory: string): Promise<string[]> {
  const typedSources = async (relative: string): Promise<string[]> =>
    (await readdir(path.join(directory, relative), { recursive: true }))
      .filter((file) => /\.(?:ts|tsx)$/.test(file) && !/\.(?:test|browser)\./.test(file))
      .sort()
      .map((file) => path.join(relative, file));
  return [
    "pnpm-lock.yaml",
    "apps/docs/scripts/generate-api-reference.mjs",
    "apps/docs/scripts/api-artifact.ts",
    "packages/standard/oxfmt.json",
    ...(await typedSources("packages/react/src")),
    "packages/react/package.json",
    ...(await typedSources("packages/styles/src")),
  ];
}

export function apiSnapshotDigest(reference: {
  upstream?: unknown;
  properties?: unknown;
  families?: unknown;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        upstream: reference.upstream,
        properties: reference.properties,
        families: reference.families,
      }),
    )
    .digest("hex");
}

export function apiSnapshotCurrent(reference: unknown, inputs: string): boolean {
  if (!reference || typeof reference !== "object") return false;
  const record = reference as Record<string, unknown>;
  const proof = record.sourceFingerprint as { inputs?: string; contents?: string } | undefined;
  return Boolean(
    proof?.inputs === inputs &&
    Array.isArray(record.properties) &&
    record.families &&
    typeof record.families === "object" &&
    proof.contents === apiSnapshotDigest(record),
  );
}
