import { expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";

// The old single job had no dependency aggregation. Exercise the actual shell
// gate so a failed, cancelled or skipped parallel job cannot authorize landing.
interface Workflow {
  on?: { push?: { tags?: string[] }; workflow_dispatch?: unknown };
  jobs: Record<
    string,
    {
      if?: string;
      needs?: string[] | string;
      environment?: string;
      permissions?: Record<string, string>;
      steps: { name?: string; run?: string; env?: Record<string, string> }[];
    }
  >;
}
const workflow = Bun.YAML.parse(
  await Bun.file(new URL("../workflows/verify.yml", import.meta.url)).text(),
) as Workflow;

test("authoritative verify rejects incomplete parallel acceptance", () => {
  expect(workflow.on).toHaveProperty("workflow_dispatch");
  const gate = workflow.jobs.verify!;
  expect(gate.if).toBe("always()");
  expect(gate.needs).toEqual(["checks", "documentation", "consumer", "browser"]);
  const step = gate.steps.find((step) => step.name === "Require every acceptance job")!;
  expect(step.env).toEqual({
    CHECKS_RESULT: "${{ needs.checks.result }}",
    DOCS_RESULT: "${{ needs.documentation.result }}",
    CONSUMER_RESULT: "${{ needs.consumer.result }}",
    BROWSER_RESULT: "${{ needs.browser.result }}",
  });
  const successful = Object.fromEntries(Object.keys(step.env!).map((key) => [key, "success"]));
  const status = (results: Record<string, string>) =>
    spawnSync("bash", ["-e", "-c", step.run!], { env: { ...process.env, ...results } }).status;
  expect(status(successful)).toBe(0);
  for (const key of Object.keys(successful)) {
    for (const result of ["failure", "cancelled", "skipped", ""]) {
      expect(status({ ...successful, [key]: result })).toBe(1);
    }
  }
});

test("documentation and consumer jobs independently build their inputs on fresh runners", () => {
  for (const [name, target] of [
    ["documentation", "ui-docs"],
    ["consumer", "docs-starter"],
  ] as const) {
    const job = workflow.jobs[name]!;
    expect(job.needs).toBeUndefined();
    const build = job.steps.find((step) => step.run?.includes("turbo run build"))!;
    const plan = JSON.parse(
      execFileSync("bash", ["-e", "-c", `${build.run} --dry=json`], { encoding: "utf8" }),
    ) as { tasks: { taskId: string }[] };
    const tasks = plan.tasks.map((task) => task.taskId);
    for (const input of ["tokens", "glass", "primitives", "ui", "docs", target])
      expect(tasks).toContain(`@lenso/${input}#build`);
    if (name === "documentation") expect(tasks).toContain("@lenso/ui-docs#generate");
  }
});

test("tag and manual publication retain npm approval between release checks", async () => {
  const release = Bun.YAML.parse(
    await Bun.file(new URL("../workflows/release.yml", import.meta.url)).text(),
  ) as Workflow;
  expect(release.on?.push?.tags).toContain("v*");
  expect(release.on).toHaveProperty("workflow_dispatch");
  const preflight = release.jobs.preflight!;
  const publication = release.jobs.release!;
  expect(preflight.permissions?.["id-token"]).not.toBe("write");
  expect(
    preflight.steps.some((step) => step.run === "bun scripts/publish-packages.ts --check"),
  ).toBe(true);
  expect(publication.needs).toBe("preflight");
  expect(publication.environment).toBe("npm");
  expect(publication.permissions?.["id-token"]).toBe("write");
  const check = publication.steps.findIndex(
    (step) => step.run === "bun scripts/publish-packages.ts --check",
  );
  const publish = publication.steps.findIndex(
    (step) => step.run === "bun scripts/publish-packages.ts",
  );
  expect(check).toBeGreaterThanOrEqual(0);
  expect(publish).toBeGreaterThan(check);
  expect(release.jobs.tags!.needs).toBe("release");
  expect(release.jobs.tags!.permissions?.["id-token"]).not.toBe("write");
});
