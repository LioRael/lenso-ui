import fs from "node:fs";

export async function existingPath(file: string): Promise<fs.Stats | undefined> {
  try {
    return await fs.promises.lstat(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
