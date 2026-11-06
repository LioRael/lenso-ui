import { copyFile, cp, mkdir } from "node:fs/promises";

await copyFile(
  new URL("../../../third-party/glass/NOTICE.md", import.meta.url),
  new URL("../dist/THIRD_PARTY_NOTICES.md", import.meta.url),
);

// Ship the complete runtime source and build configuration with the adapted backend.
await mkdir(new URL("../dist/source/", import.meta.url), { recursive: true });
await cp(new URL("../src/", import.meta.url), new URL("../dist/source/src/", import.meta.url), {
  recursive: true,
});
for (const file of ["package.json", "tsconfig.json", "tsconfig.build.json", "tsdown.config.ts"])
  await copyFile(
    new URL(`../${file}`, import.meta.url),
    new URL(`../dist/source/${file}`, import.meta.url),
  );
