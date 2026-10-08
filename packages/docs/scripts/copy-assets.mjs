import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageRoot, "../..");
const dist = resolve(packageRoot, "dist");

if (!process.argv.includes("--development")) {
  await cp(resolve(dist, "types/presentation"), resolve(dist, "presentation"), { recursive: true });
  for (const entry of ["presentation", "tabs", "highlight", "toc"]) {
    const declaration = await readFile(resolve(dist, `types/scripts/${entry}.d.ts`), "utf8");
    await writeFile(
      resolve(dist, `${entry}.d.ts`),
      declaration.replaceAll("../presentation/", "./presentation/"),
    );
  }
}
for (const entry of ["tabs", "toc"]) {
  const module = await readFile(resolve(dist, `${entry}.js`), "utf8");
  await writeFile(resolve(dist, `${entry}.js`), `"use client";\n${module}`);
}
for (const file of await readdir(resolve(packageRoot, "src"))) {
  if (file.endsWith(".d.mts"))
    await cp(resolve(packageRoot, "src", file), resolve(dist, "framework", file));
}
await rm(resolve(dist, "types"), { recursive: true, force: true });

await mkdir(resolve(dist, "fonts"), { recursive: true });
for (const file of [
  "Inter-Variable.ttf",
  "Inter-Variable-OFL.txt",
  "Inter-Variable.provenance.json",
]) {
  await cp(resolve(packageRoot, "assets/fonts", file), resolve(dist, "fonts", file));
}
await mkdir(resolve(dist, "third-party/heroui"), { recursive: true });
await cp(
  resolve(root, "third-party/heroui/LICENSE.txt"),
  resolve(dist, "third-party/heroui/LICENSE"),
);
await cp(
  resolve(root, "third-party/heroui/NOTICE.md"),
  resolve(dist, "third-party/heroui/NOTICE.md"),
);
