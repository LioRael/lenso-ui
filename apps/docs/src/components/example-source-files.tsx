import path from "node:path";
import { localExampleFiles } from "@/lib/local-example-files";
import { highlightSource } from "./highlight-source";

export async function exampleSourceFiles(entry: string) {
  return Promise.all(
    (await localExampleFiles(entry)).map(async ({ file, code }) => ({
      name: file,
      code,
      highlighted: await highlightSource(code, path.extname(file).slice(1)),
    })),
  );
}
