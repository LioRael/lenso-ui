import { createHash } from "node:crypto";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const WORKFLOW_PATH = ".github/workflows/verify.yml";
const SITE = "https://ui.lenso.dev";
const MAX_RUNS = 20;
const MAX_ARTIFACTS = 100;
const MAX_ARCHIVE_BYTES = 256 * 1024 * 1024;

export interface Context {
  repository: string;
  sha: string;
  workflowSha: string;
  workflowRef: string;
  event: string;
  ref: string;
  runId: number;
  attempt: number;
  workflow: string;
  lockfile: string;
}

export interface TrustedArtifact {
  runId: number;
  artifactId: number;
  name: string;
  digest: string;
}

export interface GitHubApi {
  get(path: string): Promise<unknown>;
  raw(path: string): Promise<string>;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid GitHub metadata");
  }
  return value as Record<string, unknown>;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function list(value: unknown, key: string, limit: number): unknown[] {
  const data = object(value);
  const items = data[key];
  if (
    !Array.isArray(items) ||
    typeof data.total_count !== "number" ||
    !Number.isSafeInteger(data.total_count) ||
    data.total_count < 0 ||
    data.total_count > limit ||
    data.total_count !== items.length
  ) {
    throw new Error("Incomplete GitHub metadata");
  }
  return items;
}

export function artifactName(context: Context, attempt = context.attempt): string {
  if (!/^[a-f0-9]{40}$/.test(context.sha) || !positiveInteger(attempt)) {
    throw new Error("Invalid artifact identity");
  }
  // Bind the lockfile, executing workflow (including tool versions), and fixed docs input.
  const inputs = createHash("sha256")
    .update(JSON.stringify(["lenso-docs-v1", context.workflow, context.lockfile, SITE]))
    .digest("hex");
  return `docs-${context.sha}-${inputs}-attempt-${attempt}`;
}

function internalRun(
  run: Record<string, unknown>,
  context: Context,
  repositoryId: number,
  workflowId: number,
): boolean {
  // REST run paths may include the source ref; the workflow endpoint stays bare.
  const pathMatches =
    run.path === WORKFLOW_PATH ||
    (typeof run.head_branch === "string" &&
      (run.path === `${WORKFLOW_PATH}@${run.head_branch}` ||
        run.path === `${WORKFLOW_PATH}@refs/heads/${run.head_branch}`));
  return (
    positiveInteger(run.id) &&
    positiveInteger(run.run_attempt) &&
    run.workflow_id === workflowId &&
    pathMatches &&
    run.event === "push" &&
    run.head_sha === context.sha &&
    object(run.repository).id === repositoryId &&
    object(run.head_repository).id === repositoryId &&
    object(run.repository).full_name === context.repository &&
    object(run.head_repository).full_name === context.repository &&
    Array.isArray(run.pull_requests) &&
    run.pull_requests.length === 0
  );
}

export async function findTrustedArtifact(
  api: GitHubApi,
  context: Context,
  now = Date.now(),
): Promise<TrustedArtifact | null> {
  if (
    context.event !== "push" ||
    context.ref !== "refs/heads/main" ||
    context.workflowSha !== context.sha ||
    context.workflowRef !== `${context.repository}/${WORKFLOW_PATH}@refs/heads/main` ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(context.repository) ||
    !/^[a-f0-9]{40}$/.test(context.sha) ||
    !positiveInteger(context.runId) ||
    !positiveInteger(context.attempt)
  ) {
    return null;
  }
  const base = `/repos/${context.repository}`;
  const current = object(await api.get(`${base}/actions/runs/${context.runId}`));
  const repositoryId = object(current.repository).id;
  const workflowId = current.workflow_id;
  if (
    !positiveInteger(repositoryId) ||
    !positiveInteger(workflowId) ||
    !internalRun(current, context, repositoryId, workflowId) ||
    current.id !== context.runId ||
    current.run_attempt !== context.attempt ||
    current.head_branch !== "main"
  ) {
    return null;
  }
  const workflow = object(await api.get(`${base}/actions/workflows/${workflowId}`));
  if (
    workflow.id !== workflowId ||
    workflow.path !== WORKFLOW_PATH ||
    workflow.state !== "active" ||
    (await api.raw(`${base}/contents/${WORKFLOW_PATH}?ref=${context.workflowSha}`)) !==
      context.workflow ||
    (await api.raw(`${base}/contents/pnpm-lock.yaml?ref=${context.sha}`)) !== context.lockfile
  ) {
    return null;
  }
  // A push run's workflow comes from its head commit. Unlike PR runs, this is the
  // executing source SHA, not a synthetic merge or a workflow_run/default-branch SHA.
  const runs = list(
    await api.get(
      `${base}/actions/workflows/${workflowId}/runs?head_sha=${context.sha}&event=push&status=success&per_page=${MAX_RUNS}`,
    ),
    "workflow_runs",
    MAX_RUNS,
  );
  for (const value of runs) {
    const run = object(value);
    if (
      !internalRun(run, context, repositoryId, workflowId) ||
      run.id === context.runId ||
      run.status !== "completed" ||
      run.conclusion !== "success" ||
      typeof run.head_branch !== "string" ||
      !/^delta\/verify\/.+$/.test(run.head_branch)
    ) {
      continue;
    }
    const name = artifactName(context, run.run_attempt as number);
    const artifacts = list(
      await api.get(`${base}/actions/runs/${run.id}/artifacts?per_page=${MAX_ARTIFACTS}`),
      "artifacts",
      MAX_ARTIFACTS,
    ).map(object);
    const matches = artifacts.filter((artifact) => artifact.name === name);
    if (matches.length !== 1) continue;
    const artifact = matches[0]!;
    const origin = object(artifact.workflow_run);
    const expires = Date.parse(String(artifact.expires_at));
    if (
      !positiveInteger(artifact.id) ||
      artifact.expired !== false ||
      !Number.isFinite(expires) ||
      expires <= now ||
      typeof artifact.size_in_bytes !== "number" ||
      artifact.size_in_bytes <= 0 ||
      artifact.size_in_bytes > MAX_ARCHIVE_BYTES ||
      typeof artifact.digest !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(artifact.digest) ||
      origin.id !== run.id ||
      origin.repository_id !== repositoryId ||
      origin.head_repository_id !== repositoryId ||
      origin.head_branch !== run.head_branch ||
      origin.head_sha !== context.sha
    ) {
      continue;
    }
    return {
      runId: run.id as number,
      artifactId: artifact.id,
      name,
      digest: artifact.digest,
    };
  }
  return null;
}

export function verifyArchive(bytes: Uint8Array, artifact: TrustedArtifact): void {
  if (
    bytes.byteLength === 0 ||
    bytes.byteLength > MAX_ARCHIVE_BYTES ||
    `sha256:${createHash("sha256").update(bytes).digest("hex")}` !== artifact.digest
  ) {
    throw new Error("Artifact digest mismatch or invalid size");
  }
}

async function boundedBody(response: Response, limit: number): Promise<Buffer> {
  if (!response.ok || !response.body) throw new Error("GitHub request failed");
  const parts: Uint8Array[] = [];
  let size = 0;
  for await (const part of response.body) {
    size += part.byteLength;
    if (size > limit) throw new Error("GitHub response exceeds limit");
    parts.push(part);
  }
  return Buffer.concat(parts);
}

export function githubApi(token: string, signal: AbortSignal, request = fetch) {
  async function response(apiPath: string, accept: string) {
    if (!apiPath.startsWith("/repos/")) throw new Error("Invalid GitHub API path");
    return request(`https://api.github.com${apiPath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal,
      redirect: "manual",
    });
  }
  return {
    async get(apiPath: string): Promise<unknown> {
      return JSON.parse(
        (
          await boundedBody(await response(apiPath, "application/vnd.github+json"), 2 * 1024 * 1024)
        ).toString("utf8"),
      );
    },
    async raw(apiPath: string): Promise<string> {
      return (
        await boundedBody(
          await response(apiPath, "application/vnd.github.raw+json"),
          2 * 1024 * 1024,
        )
      ).toString("utf8");
    },
    async download(repository: string, artifact: TrustedArtifact): Promise<Buffer> {
      const redirect = await response(
        `/repos/${repository}/actions/artifacts/${artifact.artifactId}/zip`,
        "application/vnd.github+json",
      );
      if (redirect.status !== 302) throw new Error("Missing artifact redirect");
      const location = new URL(redirect.headers.get("location") ?? "");
      if (location.protocol !== "https:" || location.username || location.password) {
        throw new Error("Invalid artifact redirect");
      }
      // GitHub supplies a signed storage URL. Never forward the API bearer token.
      const bytes = await boundedBody(
        await request(location, { signal, redirect: "error" }),
        MAX_ARCHIVE_BYTES,
      );
      verifyArchive(bytes, artifact);
      return bytes;
    },
  };
}

async function main() {
  const context: Context = {
    repository: process.env.GITHUB_REPOSITORY ?? "",
    sha: process.env.GITHUB_SHA ?? "",
    workflowSha: process.env.GITHUB_WORKFLOW_SHA ?? "",
    workflowRef: process.env.GITHUB_WORKFLOW_REF ?? "",
    event: process.env.GITHUB_EVENT_NAME ?? "",
    ref: process.env.GITHUB_REF ?? "",
    runId: Number(process.env.GITHUB_RUN_ID),
    attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    workflow: await readFile(WORKFLOW_PATH, "utf8"),
    lockfile: await readFile("pnpm-lock.yaml", "utf8"),
  };
  const output = process.env.GITHUB_OUTPUT;
  if (!output) throw new Error("Missing GitHub output file");
  if (process.argv[2] === "identity") {
    await appendFile(output, `artifact-name=${artifactName(context)}\n`);
    return;
  }
  if (process.argv[2] !== "reuse") throw new Error("Unknown command");
  try {
    const token = process.env.GH_TOKEN;
    const directory = process.env.RUNNER_TEMP;
    if (!token || !directory) throw new Error("Missing lookup configuration");
    const api = githubApi(token, AbortSignal.timeout(60_000));
    const artifact = await findTrustedArtifact(api, context);
    if (artifact) {
      await writeFile(
        path.join(directory, "trusted-docs.zip"),
        await api.download(context.repository, artifact),
      );
      await appendFile(output, "found=true\n");
      console.log(
        `Reusing verified candidate run ${artifact.runId}, artifact ${artifact.artifactId}.`,
      );
      return;
    }
  } catch {
    // No exception detail: storage redirects contain signed URLs.
    console.log("Trusted candidate evidence unavailable; running complete verification.");
  }
  await appendFile(output, "found=false\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
