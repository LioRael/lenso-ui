import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  artifactName,
  findTrustedArtifact,
  githubApi,
  verifyArchive,
  WORKFLOW_PATH,
  type Context,
  type GitHubApi,
} from "./reuse-verification.ts";

// No existing coverage exercises the CI trust boundary: a successful PR, another
// workflow, or an earlier attempt's artifact must never replace candidate checks.
function fixture() {
  const context: Context = {
    repository: "LioRael/lenso-ui",
    sha: "a".repeat(40),
    workflowSha: "a".repeat(40),
    workflowRef: `LioRael/lenso-ui/${WORKFLOW_PATH}@refs/heads/main`,
    event: "push",
    ref: "refs/heads/main",
    runId: 100,
    attempt: 1,
    workflow: "name: Verify reconstruction\n",
    lockfile: "lockfileVersion: '9.0'\n",
  };
  const repository = { id: 7, full_name: context.repository };
  const current = {
    id: context.runId,
    run_attempt: 1,
    workflow_id: 12,
    path: `${WORKFLOW_PATH}@main`,
    event: "push",
    head_sha: context.sha,
    head_branch: "main",
    repository: { ...repository },
    head_repository: { ...repository },
    pull_requests: [] as unknown[],
  };
  const candidate = {
    ...structuredClone(current),
    id: 90,
    path: `${WORKFLOW_PATH}@delta/verify/component`,
    head_branch: "delta/verify/component",
    status: "completed",
    conclusion: "success",
  };
  const bytes = Buffer.from("verified zip fixture");
  const artifact = {
    id: 50,
    name: artifactName(context),
    size_in_bytes: bytes.byteLength,
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    expired: false,
    expires_at: "2099-01-01T00:00:00Z",
    workflow_run: {
      id: candidate.id,
      repository_id: repository.id,
      head_repository_id: repository.id,
      head_branch: candidate.head_branch,
      head_sha: context.sha,
    },
  };
  const workflow = { id: 12, path: WORKFLOW_PATH, state: "active" };
  const runs = { total_count: 1, workflow_runs: [candidate] };
  const artifacts = { total_count: 1, artifacts: [artifact] };
  const calls: string[] = [];
  let sourceWorkflow = context.workflow;
  let sourceLockfile = context.lockfile;
  const api: GitHubApi = {
    async get(url) {
      calls.push(url);
      if (url.endsWith("/actions/runs/100")) return current;
      if (url.endsWith("/actions/workflows/12")) return workflow;
      if (url.includes("/actions/workflows/12/runs?")) return runs;
      if (url.includes("/actions/runs/90/artifacts?")) return artifacts;
      throw new Error(`Unexpected API call ${url}`);
    },
    async raw(url) {
      calls.push(url);
      if (url.includes(`/contents/${WORKFLOW_PATH}?ref=${context.sha}`)) return sourceWorkflow;
      if (url.includes(`/contents/pnpm-lock.yaml?ref=${context.sha}`)) return sourceLockfile;
      throw new Error(`Unexpected source lookup ${url}`);
    },
  };
  return {
    context,
    current,
    candidate,
    artifact,
    bytes,
    workflow,
    runs,
    artifacts,
    calls,
    api,
    changeSource() {
      sourceWorkflow += "# changed";
    },
    changeLockfile() {
      sourceLockfile += "# changed";
    },
  };
}

test("same-SHA internal push candidate returns its immutable artifact ID", async () => {
  const f = fixture();
  const result = await findTrustedArtifact(f.api, f.context);
  assert.deepEqual(result, {
    runId: 90,
    artifactId: 50,
    name: artifactName(f.context),
    digest: f.artifact.digest,
  });
  assert.ok(
    f.calls.some((url) => url.includes(`head_sha=${f.context.sha}&event=push&status=success`)),
  );
  assert.ok(f.calls.some((url) => url.includes("per_page=20")));
  assert.ok(f.calls.some((url) => url.includes("per_page=100")));
  verifyArchive(f.bytes, result!);
});

test("run paths accept only the bare workflow or its exact head-branch suffix", async () => {
  for (const mainSuffix of ["", "@main", "@refs/heads/main"]) {
    for (const candidateSuffix of [
      "",
      "@delta/verify/component",
      "@refs/heads/delta/verify/component",
    ]) {
      const f = fixture();
      f.current.path = `${WORKFLOW_PATH}${mainSuffix}`;
      f.candidate.path = `${WORKFLOW_PATH}${candidateSuffix}`;
      assert.equal((await findTrustedArtifact(f.api, f.context))?.artifactId, 50);
    }
  }
});

test("candidate branch eligibility remains required with a matching path suffix", async () => {
  for (const branch of ["main", "feature/component", "delta/verify/"]) {
    const f = fixture();
    f.candidate.head_branch = branch;
    f.candidate.path = `${WORKFLOW_PATH}@${branch}`;
    f.artifact.workflow_run.head_branch = branch;
    assert.equal(await findTrustedArtifact(f.api, f.context), null);
  }
});

test("artifact identity binds source, lockfile, workflow and run attempt", () => {
  const { context } = fixture();
  const original = artifactName(context);
  for (const changed of [
    { ...context, sha: "b".repeat(40) },
    { ...context, lockfile: `${context.lockfile}changed` },
    { ...context, workflow: `${context.workflow}changed` },
    { ...context, attempt: 2 },
  ]) {
    assert.notEqual(artifactName(changed), original);
  }
  assert.throws(() => artifactName({ ...context, attempt: 0 }));
  assert.throws(() => artifactName({ ...context, sha: "bad\noutput=bad" }));
});

test("only the executing main push with exact workflow SHA is eligible", async () => {
  for (const change of [
    { event: "pull_request" },
    { event: "workflow_run" },
    { ref: "refs/heads/delta/verify/component" },
    { workflowSha: "b".repeat(40) },
    { workflowRef: `LioRael/lenso-ui/${WORKFLOW_PATH}@refs/heads/other` },
    { repository: "../other" },
    { runId: 0 },
    { attempt: NaN },
  ]) {
    const f = fixture();
    assert.equal(await findTrustedArtifact(f.api, { ...f.context, ...change }), null);
    assert.equal(f.calls.length, 0);
  }
});

const rejectedRuns: [string, (f: ReturnType<typeof fixture>) => void][] = [
  ["PR success", (f) => (f.candidate.event = "pull_request")],
  ["PR association", (f) => f.candidate.pull_requests.push({ number: 3 })],
  ["fork push", (f) => (f.candidate.head_repository.id = 8)],
  ["other repository", (f) => (f.candidate.repository.id = 8)],
  ["repository rename mismatch", (f) => (f.candidate.repository.full_name = "other/repo")],
  ["different commit", (f) => (f.candidate.head_sha = "b".repeat(40))],
  ["main result", (f) => (f.candidate.head_branch = "main")],
  ["untrusted branch", (f) => (f.candidate.head_branch = "feature/component")],
  ["empty candidate branch", (f) => (f.candidate.head_branch = "delta/verify/")],
  ["different workflow ID", (f) => (f.candidate.workflow_id = 13)],
  ["different workflow path", (f) => (f.candidate.path = ".github/workflows/other.yml")],
  ["candidate path main suffix", (f) => (f.candidate.path = `${WORKFLOW_PATH}@main`)],
  [
    "candidate path different branch suffix",
    (f) => (f.candidate.path = `${WORKFLOW_PATH}@refs/heads/delta/verify/other`),
  ],
  ["candidate path SHA suffix", (f) => (f.candidate.path = `${WORKFLOW_PATH}@${f.context.sha}`)],
  [
    "candidate path pull-request suffix",
    (f) => (f.candidate.path = `${WORKFLOW_PATH}@refs/pull/3/merge`),
  ],
  [
    "different workflow with valid ref suffix",
    (f) => (f.candidate.path = `.github/workflows/other.yml@${f.candidate.head_branch}`),
  ],
  ["not completed", (f) => (f.candidate.status = "in_progress")],
  ["failed conclusion", (f) => (f.candidate.conclusion = "failure")],
  ["cancelled conclusion", (f) => (f.candidate.conclusion = "cancelled")],
  ["current run", (f) => (f.candidate.id = f.context.runId)],
  ["old attempt artifact", (f) => (f.candidate.run_attempt = 2)],
  ["workflow API identity", (f) => (f.workflow.id = 13)],
  ["workflow endpoint must stay bare", (f) => (f.workflow.path = `${WORKFLOW_PATH}@main`)],
  ["disabled workflow", (f) => (f.workflow.state = "disabled_manually")],
  ["workflow source mismatch", (f) => f.changeSource()],
  ["lockfile source mismatch", (f) => f.changeLockfile()],
  ["current API event mismatch", (f) => (f.current.event = "pull_request")],
  [
    "current path candidate suffix",
    (f) => (f.current.path = `${WORKFLOW_PATH}@delta/verify/component`),
  ],
  [
    "current path different branch suffix",
    (f) => (f.current.path = `${WORKFLOW_PATH}@refs/heads/other`),
  ],
  ["current path SHA suffix", (f) => (f.current.path = `${WORKFLOW_PATH}@${f.context.sha}`)],
  ["current API SHA mismatch", (f) => (f.current.head_sha = "b".repeat(40))],
  ["current API attempt mismatch", (f) => (f.current.run_attempt = 2)],
];
for (const [reason, change] of rejectedRuns) {
  test(`rejects ${reason}`, async () => {
    const f = fixture();
    change(f);
    assert.equal(await findTrustedArtifact(f.api, f.context), null);
    if (reason !== "old attempt artifact") {
      assert.ok(!f.calls.some((url) => url.includes("/actions/runs/90/artifacts?")));
    }
  });
}

const rejectedArtifacts: [string, (f: ReturnType<typeof fixture>) => void][] = [
  ["wrong input name", (f) => (f.artifact.name = `docs-${f.context.sha}`)],
  ["expired flag", (f) => (f.artifact.expired = true)],
  ["expired timestamp", (f) => (f.artifact.expires_at = "2000-01-01")],
  ["invalid expiry", (f) => (f.artifact.expires_at = "not a date")],
  ["missing digest", (f) => (f.artifact.digest = "")],
  ["wrong digest algorithm", (f) => (f.artifact.digest = `sha1:${"a".repeat(40)}`)],
  ["empty artifact", (f) => (f.artifact.size_in_bytes = 0)],
  ["oversized archive", (f) => (f.artifact.size_in_bytes = 257 * 1024 * 1024)],
  ["wrong run origin", (f) => (f.artifact.workflow_run.id = 91)],
  ["wrong repository origin", (f) => (f.artifact.workflow_run.repository_id = 8)],
  ["fork artifact origin", (f) => (f.artifact.workflow_run.head_repository_id = 8)],
  ["wrong branch origin", (f) => (f.artifact.workflow_run.head_branch = "feature/component")],
  ["wrong SHA origin", (f) => (f.artifact.workflow_run.head_sha = "b".repeat(40))],
  [
    "duplicate identity",
    (f) => {
      f.artifacts.artifacts.push({ ...f.artifact, id: 51 });
      f.artifacts.total_count++;
    },
  ],
  [
    "missing artifact",
    (f) => {
      f.artifacts.artifacts = [];
      f.artifacts.total_count = 0;
    },
  ],
];
for (const [reason, change] of rejectedArtifacts) {
  test(`rejects ${reason}`, async () => {
    const f = fixture();
    change(f);
    assert.equal(await findTrustedArtifact(f.api, f.context), null);
  });
}

test("a rerun is reusable only with its current attempt's immutable artifact", async () => {
  const f = fixture();
  f.candidate.run_attempt = 2;
  f.artifact.name = artifactName(f.context, 2);
  assert.equal((await findTrustedArtifact(f.api, f.context))?.artifactId, 50);
});

test("incomplete or malformed API metadata cannot produce trusted evidence", async () => {
  for (const change of [
    (f: ReturnType<typeof fixture>) => (f.runs.total_count = 21),
    (f: ReturnType<typeof fixture>) => (f.runs.total_count = 2),
    (f: ReturnType<typeof fixture>) => (f.artifacts.total_count = 101),
    (f: ReturnType<typeof fixture>) => (f.artifacts.total_count = 2),
  ]) {
    const f = fixture();
    change(f);
    await assert.rejects(findTrustedArtifact(f.api, f.context), /Incomplete GitHub metadata/);
  }
  const f = fixture();
  await assert.rejects(findTrustedArtifact({ ...f.api, get: async () => null }, f.context));
  await assert.rejects(
    findTrustedArtifact(
      {
        ...f.api,
        get: async () => {
          throw new Error("rate limited");
        },
      },
      f.context,
    ),
    /rate limited/,
  );
});

test("download verifies digest and never forwards GitHub credentials to storage", async () => {
  const f = fixture();
  const trusted = (await findTrustedArtifact(f.api, f.context))!;
  const calls: { url: string; init?: RequestInit }[] = [];
  const request: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return calls.length === 1
      ? new Response(null, {
          status: 302,
          headers: { location: "https://storage.example/docs.zip" },
        })
      : new Response(f.bytes);
  };
  const api = githubApi("test-only-token", AbortSignal.timeout(1000), request);
  assert.deepEqual(await api.download(f.context.repository, trusted), f.bytes);
  assert.equal(
    calls[0]?.url,
    `https://api.github.com/repos/LioRael/lenso-ui/actions/artifacts/50/zip`,
  );
  assert.equal(new Headers(calls[0]?.init?.headers).get("Authorization"), "Bearer test-only-token");
  assert.equal(calls[1]?.init?.headers, undefined);
  assert.equal(calls[1]?.init?.redirect, "error");
  assert.throws(() => verifyArchive(Buffer.from("tampered"), trusted), /digest mismatch/);
  assert.throws(() => verifyArchive(new Uint8Array(), trusted), /invalid size/);
});

test("unsafe redirects, digest mismatches, and GitHub API failures reject download", async () => {
  const f = fixture();
  const trusted = (await findTrustedArtifact(f.api, f.context))!;
  for (const location of [
    "http://storage.example/file",
    "https://user:pass@storage.example/file",
  ]) {
    const request: typeof fetch = async () =>
      new Response(null, { status: 302, headers: { location } });
    await assert.rejects(
      githubApi("test-only-token", AbortSignal.timeout(1000), request).download(
        f.context.repository,
        trusted,
      ),
      /Invalid artifact redirect/,
    );
  }
  const failure: typeof fetch = async () => new Response(null, { status: 403 });
  const api = githubApi("test-only-token", AbortSignal.timeout(1000), failure);
  await assert.rejects(
    api.get("/repos/LioRael/lenso-ui/actions/runs/100"),
    /GitHub request failed/,
  );
  await assert.rejects(api.download(f.context.repository, trusted), /Missing artifact redirect/);
  let requests = 0;
  const corrupt: typeof fetch = async () =>
    ++requests === 1
      ? new Response(null, { status: 302, headers: { location: "https://storage.example/file" } })
      : new Response("tampered");
  await assert.rejects(
    githubApi("test-only-token", AbortSignal.timeout(1000), corrupt).download(
      f.context.repository,
      trusted,
    ),
    /digest mismatch/,
  );
});

test("CLI selects complete verification when trust configuration is unavailable or event is a PR", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-ci-reuse-"));
  try {
    for (const event of ["push", "pull_request"]) {
      const output = path.join(directory, `${event}.txt`);
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(new URL("./reuse-verification.ts", import.meta.url)), "reuse"],
        {
          cwd: fileURLToPath(new URL("../../", import.meta.url)),
          env: {
            GITHUB_OUTPUT: output,
            RUNNER_TEMP: directory,
            GITHUB_EVENT_NAME: event,
            GH_TOKEN: event === "push" ? "" : "test-only-token",
          },
          encoding: "utf8",
          timeout: 5000,
        },
      );
      assert.equal(result.status, 0, result.stderr);
      assert.equal(await readFile(output, "utf8"), "found=false\n");
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("API payload and redirect handling are bounded and fail closed", async () => {
  const oversized: typeof fetch = async () => new Response("x".repeat(2 * 1024 * 1024 + 1));
  await assert.rejects(
    githubApi("test-only-token", AbortSignal.timeout(1000), oversized).get("/repos/owner/repo"),
    /exceeds limit/,
  );
  const redirect: typeof fetch = async () =>
    new Response(null, { status: 302, headers: { location: "https://other.example" } });
  await assert.rejects(
    githubApi("test-only-token", AbortSignal.timeout(1000), redirect).get("/repos/owner/repo"),
    /GitHub request failed/,
  );
});
