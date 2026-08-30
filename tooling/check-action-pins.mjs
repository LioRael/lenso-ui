import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const pinnedRefPattern = /^[0-9a-f]{40}$/u;
const usesPattern = /^\s*(?:-\s*)?uses:\s*["']?([^\s"'#]+)["']?/u;

export async function findUnpinnedActions(root = process.cwd()) {
  const workflowRoot = join(root, ".github/workflows");
  const files = await findWorkflowFiles(workflowRoot);
  const unpinned = [];
  for (const file of files) {
    const lines = (await readFile(file, "utf8")).split("\n");
    for (const [index, line] of lines.entries()) {
      const action = line.match(usesPattern)?.[1];
      if (!action || action.startsWith("./") || action.startsWith("docker://")) {
        continue;
      }
      const separator = action.lastIndexOf("@");
      const ref = separator === -1 ? "" : action.slice(separator + 1);
      if (!pinnedRefPattern.test(ref)) {
        unpinned.push({
          action,
          line: index + 1,
          path: relative(root, file),
        });
      }
    }
  }
  return unpinned;
}

export async function checkActionPins(root = process.cwd()) {
  const unpinned = await findUnpinnedActions(root);
  if (unpinned.length > 0) {
    throw new Error(
      `GitHub Actions must use full commit SHAs:\n${unpinned
        .map(({ action, line, path }) => `${path}:${line} ${action}`)
        .join("\n")}`,
    );
  }
}

async function findWorkflowFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findWorkflowFiles(path)));
    } else if (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml")) {
      files.push(path);
    }
  }
  return files.sort();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await checkActionPins();
  console.log("All GitHub Actions use full commit SHAs.");
}
