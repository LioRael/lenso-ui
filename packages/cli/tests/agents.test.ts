import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { type TestContext } from "node:test";
import { planAgentDocs, planSkills } from "../src/agents.ts";
import { applyPlan } from "../src/project.ts";
import { fixture, authoredMarkdown } from "./fixture.ts";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
async function consumer(t: TestContext) {
  const directory = path.join(repository, "test-results/cli-agents");
  await mkdir(directory, { recursive: true });
  const cwd = await mkdtemp(path.join(directory, "consumer-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(path.join(cwd, "package.json"), '{"name":"consumer","private":true}\n');
  return cwd;
}

// The previous repo-local skills were not delivered by the installed CLI.
// Prove its plans preserve authored files and materialize exact portable data.
test("agent docs are dry-run, preserve authored text and materialize exact contract Markdown", async (t) => {
  const cwd = await consumer(t);
  const contract = await fixture();
  const authored = "# Project instructions\n\nKeep my conventions.\n";
  await writeFile(path.join(cwd, "AGENTS.md"), authored);
  await writeFile(path.join(cwd, ".gitignore"), "node_modules/\n");
  const before = await readdir(cwd);
  const plan = await planAgentDocs(cwd, contract);
  assert.deepEqual(plan.conflicts, []);
  assert.equal(plan.dryRun, true);
  assert.deepEqual(await readdir(cwd), before);
  assert.equal(await readFile(path.join(cwd, "AGENTS.md"), "utf8"), authored);
  assert.equal((await applyPlan(plan)).applied, true);
  const document = contract.docs.find((entry) => entry.locale === "en");
  assert.ok(document);
  assert.equal(
    await readFile(path.join(cwd, `.lenso-ui/docs/en/${document.slug}.md`), "utf8"),
    authoredMarkdown("en"),
  );
  assert.ok((await readFile(path.join(cwd, "AGENTS.md"), "utf8")).startsWith(authored));
  assert.equal(await readFile(path.join(cwd, ".gitignore"), "utf8"), "node_modules/\n.lenso-ui/\n");
  assert.deepEqual((await planAgentDocs(cwd, contract)).changes, []);
});

test("agent reference ownership permits outside edits but refuses changed blocks and documents", async (t) => {
  const cwd = await consumer(t);
  const contract = await fixture();
  await applyPlan(await planAgentDocs(cwd, contract));
  const document = contract.docs.find((entry) => entry.locale === "en");
  assert.ok(document);
  const agent = path.join(cwd, "AGENTS.md");
  const original = await readFile(agent, "utf8");
  await writeFile(agent, `My later instructions.\n${original}`);
  const next = await planAgentDocs(cwd, contract, "cn");
  assert.deepEqual(next.conflicts, []);
  await applyPlan(next);
  assert.ok((await readFile(agent, "utf8")).startsWith("My later instructions.\n"));
  await writeFile(
    agent,
    (await readFile(agent, "utf8")).replace("## Lenso UI reference", "## Custom reference"),
  );
  await assert.rejects(planAgentDocs(cwd, contract), /user-owned or edited/);
  await writeFile(agent, original);
  await writeFile(path.join(cwd, `.lenso-ui/docs/en/${document.slug}.md`), "User document");
  assert.ok(
    (await planAgentDocs(cwd, contract)).conflicts.some((conflict) => conflict.includes("menu.md")),
  );
});

test("malformed agent blocks, stale plans and linked inputs refuse writes", async (t) => {
  const cwd = await consumer(t);
  const contract = await fixture();
  await writeFile(path.join(cwd, "AGENTS.md"), "<!-- lenso-ui:begin -->\nMissing end");
  await assert.rejects(planAgentDocs(cwd, contract), /Malformed/);
  await writeFile(path.join(cwd, "AGENTS.md"), "Authored");
  const plan = await planAgentDocs(cwd, contract);
  await writeFile(path.join(cwd, "AGENTS.md"), "Changed after planning");
  await assert.rejects(applyPlan(plan), /changed|stale/i);
  await rm(path.join(cwd, "AGENTS.md"));
  await symlink(path.join(cwd, "package.json"), path.join(cwd, "AGENTS.md"));
  await assert.rejects(planAgentDocs(cwd, contract), /linked/);
});

test("skill planning includes both sibling workflows and licenses and never overwrites authored skills", async (t) => {
  const cwd = await consumer(t);
  const contract = await fixture();
  const skillsRoot = new URL("../../../.agents/skills/", import.meta.url);
  const plan = await planSkills(cwd, contract, { skillsRoot });
  assert.deepEqual(plan.conflicts, []);
  assert.equal(plan.dryRun, true);
  assert.deepEqual(await readdir(cwd), ["package.json"]);
  await applyPlan(plan);
  for (const name of ["lenso-ui", "lenso-ui-design"]) {
    for (const file of ["SKILL.md", "LICENSE.txt"]) {
      assert.equal(
        await readFile(path.join(cwd, `.agents/skills/${name}/${file}`), "utf8"),
        await readFile(new URL(`${name}/${file}`, skillsRoot), "utf8"),
      );
    }
  }
  assert.deepEqual((await planSkills(cwd, contract, { skillsRoot })).changes, []);
  await writeFile(path.join(cwd, ".agents/skills/lenso-ui/SKILL.md"), "My custom workflow");
  assert.ok((await planSkills(cwd, contract, { skillsRoot })).conflicts.length > 0);
});
