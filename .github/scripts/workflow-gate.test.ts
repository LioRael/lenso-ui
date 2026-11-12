import { expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";

// The old single job had no dependency aggregation. Exercise the actual shell
// gate so a failed, cancelled or skipped parallel job cannot authorize landing.
interface Workflow {
  jobs: Record<
    string,
    {
      if?: string;
      needs?: string[];
      steps: { name?: string; run?: string; env?: Record<string, string> }[];
    }
  >;
}
const workflow = Bun.YAML.parse(
  await Bun.file(new URL("../workflows/verify.yml", import.meta.url)).text(),
) as Workflow;

test("authoritative verify rejects incomplete parallel acceptance", () => {
  const gate = workflow.jobs.verify!;
  expect(gate.if).toBe("always()");
  expect(gate.needs).toEqual(["checks", "documentation"]);
  const step = gate.steps.find((step) => step.name === "Require every acceptance job")!;
  expect(step.env).toEqual({
    CHECKS_RESULT: "${{ needs.checks.result }}",
    DOCS_RESULT: "${{ needs.documentation.result }}",
  });
  for (const checks of ["success", "failure", "cancelled", "skipped", ""]) {
    for (const docs of ["success", "failure", "cancelled", "skipped", ""]) {
      const result = spawnSync("bash", ["-e", "-c", step.run!], {
        env: { ...process.env, CHECKS_RESULT: checks, DOCS_RESULT: docs },
      });
      expect(result.status === 0).toBe(checks === "success" && docs === "success");
    }
  }
});

test("documentation graph builds its dependencies on a fresh runner", () => {
  const build = workflow.jobs.documentation!.steps.find((step) =>
    step.run?.includes("turbo run build"),
  )!;
  const plan = JSON.parse(
    execFileSync("bash", ["-e", "-c", `${build.run} --dry=json`], { encoding: "utf8" }),
  ) as { tasks: { taskId: string }[] };
  const tasks = plan.tasks.map((task) => task.taskId);
  for (const name of ["tokens", "glass", "primitives", "ui", "docs", "ui-docs"])
    expect(tasks).toContain(`@lenso/${name}#build`);
  expect(tasks).toContain("@lenso/ui-docs#generate");
});
