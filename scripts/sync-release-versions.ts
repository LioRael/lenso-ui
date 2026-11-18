import { readFile, writeFile } from "node:fs/promises";

const docs = JSON.parse(await readFile("packages/docs/package.json", "utf8"));
const path = "packages/create-docs/template/package.json";
const template = JSON.parse(await readFile(path, "utf8"));
template.dependencies["@lenso/docs"] = docs.version;
await writeFile(path, JSON.stringify(template, null, 2) + "\n");
