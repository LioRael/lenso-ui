import { readFile } from "node:fs/promises";
import { checkDesignPolicy } from "./index.ts";

const [mode, ...args] = process.argv.slice(2);
const strict = args.includes("--strict");
const filenames = args.filter((argument) => argument !== "--strict");
if (!filenames.length)
  throw new Error("Usage: lenso-ui policy <library|consumer> [--strict] <files...>");
const files = await Promise.all(
  filenames.map(async (filename) => ({
    filename,
    source: await readFile(filename, "utf8"),
  })),
);
const result = checkDesignPolicy({ files, mode });
console.log(JSON.stringify(result, null, 2));
if (result.diagnostics.length || (strict && result.skipped.length)) process.exitCode = 1;
