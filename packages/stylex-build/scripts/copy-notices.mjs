import { copyFile } from "node:fs/promises";

await copyFile(
  new URL("../../../third-party/stylex/NOTICE.md", import.meta.url),
  new URL("../NOTICE.md", import.meta.url),
);
