import { copyFile } from "node:fs/promises";

await Promise.all(
  ["LICENSE.txt", "NOTICE.md"].map((name) =>
    copyFile(
      new URL(`../../../third-party/heroui/${name}`, import.meta.url),
      new URL(`../dist/HEROUI-${name}`, import.meta.url),
    ),
  ),
);
