import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

/** Stage built browser assets without replacing the application's page module or manifest. */
export async function stageWeb(appDirectory: string) {
  const destination = path.resolve(appDirectory, "modules/web/lenso-ui");
  await mkdir(destination, { recursive: true });
  await cp(path.resolve(import.meta.dirname, "../dist"), destination, { recursive: true });
  return destination;
}
