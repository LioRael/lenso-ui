import { localExampleFiles } from "@/lib/local-example-files";

export async function exampleSourceFiles(entry: string) {
  return (await localExampleFiles(entry)).map(({ file, code }) => ({ name: file, code }));
}
