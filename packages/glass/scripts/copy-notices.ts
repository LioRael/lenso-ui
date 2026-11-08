import { copyFile, cp, mkdir, rm } from "node:fs/promises";

await copyFile(
  new URL("../../../THIRD_PARTY_NOTICES.md", import.meta.url),
  new URL("../dist/THIRD_PARTY_NOTICES.md", import.meta.url),
);

// Ship the complete runtime source and build configuration with the adapted backend.
await rm(new URL("../dist/source/", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("../dist/source/", import.meta.url), { recursive: true });
await cp(new URL("../src/", import.meta.url), new URL("../dist/source/src/", import.meta.url), {
  recursive: true,
});
for (const file of ["package.json", "tsconfig.json", "tsconfig.build.json", "tsdown.config.ts"])
  await copyFile(
    new URL(`../${file}`, import.meta.url),
    new URL(`../dist/source/${file}`, import.meta.url),
  );

await cp(
  new URL("../shaders/", import.meta.url),
  new URL("../dist/source/shaders/", import.meta.url),
  { recursive: true },
);
await cp(
  new URL("../scripts/", import.meta.url),
  new URL("../dist/source/scripts/", import.meta.url),
  { recursive: true },
);
