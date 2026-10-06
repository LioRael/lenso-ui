import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const workflows = ["lenso-ui", "lenso-ui-design"];

async function readWorkflowGraph(directory: string) {
  const pending = workflows.map((name) => `${name}/SKILL.md`);
  const visited = new Set<string>();
  while (pending.length) {
    const relative = pending.pop()!;
    if (visited.has(relative)) continue;
    visited.add(relative);
    const filename = path.resolve(directory, relative);
    const boundary = path.relative(directory, filename);
    assert.ok(
      !boundary.startsWith("..") && !path.isAbsolute(boundary),
      `Outside skill bundle: ${relative}`,
    );
    const source = await readFile(filename, "utf8");
    if (path.basename(filename) === "SKILL.md") {
      assert.match(source, new RegExp(`^---\\nname: ${path.basename(path.dirname(filename))}\\n`));
      assert.match(source, /^description: .+$/m);
    }
    const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
    for (const match of prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1]!.split("#")[0]!;
      if (!target || /^[a-z]+:/i.test(target)) continue;
      pending.push(path.join(path.dirname(relative), target));
    }
  }
  return visited;
}

// The existing skill was source-local only. Cross-workflow routing and new
// progressive references must still resolve when users copy the bundle.
test("Lenso agent workflows remain discoverable and self-contained outside the source tree", async (t) => {
  const scratch = path.join(root, "test-results/agent-skills");
  await mkdir(scratch, { recursive: true });
  const directory = await mkdtemp(path.join(scratch, "copy-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const name of workflows) {
    await cp(path.join(root, ".agents/skills", name), path.join(directory, name), {
      recursive: true,
    });
  }
  const source = await readWorkflowGraph(path.join(root, ".agents/skills"));
  assert.deepEqual(await readWorkflowGraph(directory), source);
  assert.ok(
    source.size > workflows.length,
    "The copied bundle must include its reached references.",
  );
  assert.equal(
    await readFile(path.join(directory, "lenso-ui/LICENSE.txt"), "utf8"),
    await readFile(path.join(root, "third-party/heroui/LICENSE.txt"), "utf8"),
    "The adapted workflow must preserve the full original license.",
  );
  assert.equal(
    await readFile(path.join(directory, "lenso-ui-design/LICENSE.txt"), "utf8"),
    await readFile(path.join(root, "LICENSE"), "utf8"),
    "The first-party design workflow must carry its own license.",
  );
});

test("a missing progressive reference fails instead of certifying an incomplete skill copy", async (t) => {
  const scratch = path.join(root, "test-results/agent-skills");
  await mkdir(scratch, { recursive: true });
  const directory = await mkdtemp(path.join(scratch, "incomplete-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const name of workflows) {
    await cp(path.join(root, ".agents/skills", name), path.join(directory, name), {
      recursive: true,
    });
  }
  await rm(path.join(directory, "lenso-ui/references/setup.md"));
  await assert.rejects(readWorkflowGraph(directory), { code: "ENOENT" });
});
