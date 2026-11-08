import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Readers see either complete version, and unchanged generation leaves HMR alone.
export async function writeGeneratedFile(file: string | URL, content: string) {
  const target = typeof file === "string" ? file : fileURLToPath(file);
  try {
    if ((await readFile(target, "utf8")) === content) return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}
