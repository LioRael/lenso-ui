import { test } from "bun:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./release-plan.ts", import.meta.url));

test("release automation requires consumed changesets and successful current-main push evidence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-release-plan-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  const commit = () => {
    git("add", ".");
    git(
      "-c",
      "commit.gpgsign=false",
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "-qm",
      "fixture",
    );
  };
  const manifest = async (version: string) =>
    writeFile(
      join(directory, "packages/ui/package.json"),
      JSON.stringify({ name: "@lenso/ui", version }),
    );
  try {
    git("init", "-q", "--initial-branch=main");
    git("remote", "add", "origin", ".");
    await mkdir(join(directory, "packages/ui"), { recursive: true });
    await mkdir(join(directory, ".changeset"));
    await manifest("0.11.4");
    await writeFile(
      join(directory, ".changeset/patch.md"),
      '---\n"@lenso/ui": patch\n---\n\nFix lifecycle.\n',
    );
    commit();
    const run = async (patch: Record<string, unknown> = {}) => {
      const event = {
        workflow_run: {
          event: "push",
          head_branch: "main",
          head_sha: git("rev-parse", "HEAD"),
          conclusion: "success",
          head_repository: { full_name: "LioRael/lenso-ui" },
          ...patch,
        },
      };
      const eventPath = join(directory, ".git/event.json");
      const output = join(directory, ".git/output");
      await writeFile(eventPath, JSON.stringify(event));
      await writeFile(output, "");
      const result = spawnSync(process.execPath, [script], {
        cwd: directory,
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_EVENT_NAME: "workflow_run",
          GITHUB_REPOSITORY: "LioRael/lenso-ui",
          GITHUB_EVENT_PATH: eventPath,
          GITHUB_OUTPUT: output,
        },
      });
      return { ...result, output: await readFile(output, "utf8") };
    };
    let result = await run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, /mode=version/);
    for (const patch of [
      { event: "pull_request" },
      { conclusion: "failure" },
      { head_branch: "topic" },
      { head_sha: "wrong" },
      { head_repository: { full_name: "fork/lenso-ui" } },
    ]) {
      assert.notEqual((await run(patch)).status, 0, JSON.stringify(patch));
    }
    await rm(join(directory, ".changeset/patch.md"));
    await manifest("0.11.5");
    commit();
    result = await run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, /mode=publish/);
    assert.match(result.output, /version=0\.11\.5/);
    await writeFile(join(directory, "README.md"), "Unrelated documentation.\n");
    commit();
    result = await run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, /mode=none/);
    await manifest("0.11.6");
    commit();
    assert.match(
      (await run()).output,
      /mode=none/,
      "a manual version edit is not a consumed Changesets release",
    );
    git("checkout", "-qb", "candidate");
    await writeFile(join(directory, ".changeset/late.md"), "Superseded pending changeset.\n");
    commit();
    assert.match(
      (await run()).output,
      /mode=none/,
      "superseded main evidence cannot start release automation",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
