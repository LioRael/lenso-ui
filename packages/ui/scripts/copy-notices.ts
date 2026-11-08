import { copyFile } from "node:fs/promises";

await copyFile(
  new URL("../../../THIRD_PARTY_NOTICES.md", import.meta.url),
  new URL("../dist/THIRD_PARTY_NOTICES.md", import.meta.url),
);
