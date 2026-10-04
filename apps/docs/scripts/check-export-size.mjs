import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MAX_EXPORT_FILE_BYTES = 25 * 1024 * 1024;

export async function checkExportSize(directory) {
  const root = path.resolve(directory);
  const files = [];
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Cannot verify symbolic export entry: ${path.relative(root, file)}`);
      if (entry.isDirectory()) {
        await visit(file);
      } else if (entry.isFile()) {
        files.push({ file: path.relative(root, file), bytes: (await stat(file)).size });
      }
    }
  }
  await visit(root);
  const oversized = files.filter((file) => file.bytes > MAX_EXPORT_FILE_BYTES);
  if (oversized.length) {
    throw new Error(
      `Export exceeds Cloudflare's ${MAX_EXPORT_FILE_BYTES}-byte file limit:\n${oversized
        .map(({ file, bytes }) => `${file}: ${bytes} bytes`)
        .join("\n")}`,
    );
  }
  return {
    files: files.length,
    maxFileBytes: MAX_EXPORT_FILE_BYTES,
    largest: files.reduce(
      (largest, file) => (!largest || file.bytes > largest.bytes ? file : largest),
      undefined,
    ),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const directory = process.argv[2] ?? fileURLToPath(new URL("../out/", import.meta.url));
  console.log(JSON.stringify(await checkExportSize(directory), null, 2));
}
