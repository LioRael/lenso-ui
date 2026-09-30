import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir(new URL("../dist", import.meta.url), { recursive: true });
await cp(new URL("../styles.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));
const compiled = new URL("../dist/assets/stylex.css", import.meta.url);
const stylesheet = new URL("../dist/styles.css", import.meta.url);
try {
  await readFile(compiled);
  await writeFile(
    stylesheet,
    `${await readFile(stylesheet, "utf8")}\n@import "./assets/stylex.css";\n`,
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await cp(new URL("../themes", import.meta.url), new URL("../dist/themes", import.meta.url), {
  recursive: true,
});
await cp(new URL("../base", import.meta.url), new URL("../dist/base", import.meta.url), {
  recursive: true,
});
await cp(
  new URL("../../../third-party/heroui", import.meta.url),
  new URL("../dist/third-party/heroui", import.meta.url),
  { recursive: true },
);
