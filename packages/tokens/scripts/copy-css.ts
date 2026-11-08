import { cp, mkdir } from "node:fs/promises";

await mkdir(new URL("../dist", import.meta.url), { recursive: true });
await cp(new URL("../styles.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));
await cp(new URL("../styles.css", import.meta.url), new URL("../dist/theme.css", import.meta.url));
await cp(new URL("../themes", import.meta.url), new URL("../dist/themes", import.meta.url), {
  recursive: true,
});
await cp(new URL("../base", import.meta.url), new URL("../dist/base", import.meta.url), {
  recursive: true,
});
await cp(
  new URL("../../../THIRD_PARTY_NOTICES.md", import.meta.url),
  new URL("../dist/THIRD_PARTY_NOTICES.md", import.meta.url),
);
