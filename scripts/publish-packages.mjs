import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = "https://registry.npmjs.org/";
export const packages = [
  { dir: "packages/styles", name: "@lenso/tokens", kind: "tokens" },
  { dir: "packages/react", name: "@lenso/ui", kind: "ui" },
  { dir: "packages/stylex-build", name: "@lenso/stylex-build", kind: "build", version: "0.1.0" },
  { dir: "packages/docs", name: "@lenso/docs", kind: "docs", version: "0.1.0" },
  { dir: "packages/create-docs", name: "create-lenso-docs", kind: "initializer", version: "0.1.0" },
];

export function selectPackages(scope = "all") {
  if (scope === "all") return packages;
  if (scope === "ui")
    return packages.filter((item) => item.kind === "tokens" || item.kind === "ui");
  throw new Error("LENSO_RELEASE_SCOPE must be ui or all");
}

export function validateContext(env, head, remoteHead, manifests) {
  if (env.GITHUB_ACTIONS !== "true") throw new Error("must run in GitHub Actions");
  if (env.GITHUB_REF !== "refs/heads/main") throw new Error("must run on refs/heads/main");
  if (!env.GITHUB_SHA || head !== env.GITHUB_SHA || remoteHead !== env.GITHUB_SHA) {
    throw new Error("checkout HEAD and origin/main must equal GITHUB_SHA");
  }
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(env.LENSO_RELEASE_VERSION ?? "")) {
    throw new Error("LENSO_RELEASE_VERSION must be canonical stable semver");
  }
  const selected = selectPackages(env.LENSO_RELEASE_SCOPE);
  if (manifests.length !== selected.length)
    throw new Error("package manifests must match the selected release scope");
  for (const [i, item] of selected.entries()) {
    if (
      manifests[i].name !== item.name ||
      manifests[i].private === true ||
      manifests[i].version !== (item.version ?? env.LENSO_RELEASE_VERSION)
    ) {
      throw new Error(`unexpected package identity or version in ${item.dir}`);
    }
  }
  return env.LENSO_RELEASE_VERSION;
}

export function validatePackage(manifest, files, contents, item, version) {
  if (manifest.name !== item.name || manifest.private === true || manifest.version !== version) {
    throw new Error(`unexpected package identity for ${item.name}`);
  }
  const names = new Set(files);
  const requireFile = (path) => {
    if (!names.has(path)) throw new Error(`${item.name} tarball missing ${path}`);
  };
  const resolveExport = (target) => {
    const path = `package/${target.replace(/^\.\//, "")}`;
    if (path.includes("*")) {
      const prefix = path.slice(0, path.indexOf("*"));
      const suffix = path.slice(path.indexOf("*") + 1);
      if (![...names].some((name) => name.startsWith(prefix) && name.endsWith(suffix))) {
        throw new Error(`${item.name} export does not resolve: ${target}`);
      }
    } else requireFile(path);
  };
  const walk = (value) => {
    if (typeof value === "string" && value.startsWith("./")) resolveExport(value);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(manifest.exports);
  for (const target of Object.values(manifest.bin ?? {})) resolveExport(target);
  for (const dependencies of [
    manifest.dependencies,
    manifest.optionalDependencies,
    manifest.peerDependencies,
  ]) {
    for (const value of Object.values(dependencies ?? {})) {
      if (/^(workspace:|catalog:)/.test(value))
        throw new Error(`${item.name} has unresolved dependency protocol: ${value}`);
    }
  }
  if (
    [...names].some(
      (name) =>
        /(?:credential|secret|screenshot|\.npmrc)/i.test(name) ||
        /(?:^|[./_-])(?:test|tests|spec|specs)(?:[./_-]|$)/i.test(name),
    )
  ) {
    throw new Error(`${item.name} tarball contains credential, test, or screenshot files`);
  }
  if (item.kind === "tokens") {
    requireFile("package/dist/styles.css");
    requireFile("package/dist/assets/stylex.css");
    requireFile("package/dist/third-party/heroui/LICENSE.txt");
    requireFile("package/src/tokens.stylex.const.ts");
    if (!contents["package/src/tokens.stylex.const.ts"])
      throw new Error("tokens source const is empty");
  } else if (item.kind === "docs") {
    for (const path of [
      "package/LICENSE",
      "package/LICENSE.FUMADOCS",
      "package/NOTICE.md",
      "package/dist/fonts/Inter-Variable-OFL.txt",
      "package/dist/third-party/heroui/LICENSE",
    ])
      requireFile(path);
  } else if (item.kind === "initializer") {
    requireFile("package/LICENSE");
    requireFile("package/template/package.json");
  } else if (item.kind === "build") {
    requireFile("package/LICENSE");
    requireFile("package/NOTICE.md");
  } else if (item.kind === "ui") {
    requireFile("package/dist/index.js");
    requireFile("package/dist/index.d.ts");
    requireFile("package/dist/HEROUI-LICENSE.txt");
    requireFile("package/dist/HEROUI-NOTICE.md");
    if (manifest.dependencies?.["@lenso/tokens"] !== version) {
      throw new Error("@lenso/ui must depend on the released @lenso/tokens version");
    }
  }
}

export function shouldSkipExisting(metadata, version, integrity, item) {
  const published = metadata?.versions?.[version];
  if (!published) return false;
  if (published.version !== version) {
    throw new Error(`registry version mismatch for ${item.name}@${version}`);
  }
  if (published.dist?.integrity !== integrity)
    throw new Error(`immutable version collision for ${item.name}@${version}`);
  if (item.kind === "ui" && published.dependencies?.["@lenso/tokens"] !== version) {
    throw new Error(`registry dependency mismatch for ${item.name}@${version}`);
  }
  return true;
}

export async function waitForPublication(
  item,
  version,
  integrity,
  {
    readMetadata = metadata,
    sleep = delay,
    now = Date.now,
    timeoutMs = 600_000,
    intervalMs = 5_000,
    log = console.log,
  } = {},
) {
  const deadline = now() + timeoutMs;
  let announced = false;
  while (now() < deadline) {
    const published = await readMetadata(item.name, Math.min(15_000, deadline - now()));
    if (
      shouldSkipExisting(published, version, integrity, item) &&
      published["dist-tags"]?.latest === version
    ) {
      return published;
    }
    if (now() >= deadline) break;
    if (!announced) {
      log(`Waiting for npm processing and registry visibility: ${item.name}@${version}`);
      announced = true;
    }
    await sleep(Math.min(intervalMs, deadline - now()));
  }
  throw new Error(`npm processing timed out for ${item.name}@${version}; do not republish blindly`);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  }).trim();
}

async function metadata(name, timeoutMs = 15_000) {
  const response = await fetch(new URL(encodeURIComponent(name), registry), {
    headers: { "cache-control": "no-cache" },
    signal: AbortSignal.timeout(Math.max(1, timeoutMs)),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`registry metadata request failed: HTTP ${response.status}`);
  return response.json();
}

async function publish() {
  const env = process.env;
  const selected = selectPackages(env.LENSO_RELEASE_SCOPE);
  const head = run("git", ["rev-parse", "HEAD"]);
  const remoteHead = run("git", ["ls-remote", "origin", "refs/heads/main"]).split(/\s/)[0];
  const manifests = await Promise.all(
    selected.map(async (item) =>
      JSON.parse(await readFile(join(root, item.dir, "package.json"), "utf8")),
    ),
  );
  const version = validateContext(env, head, remoteHead, manifests);
  const temp = await mkdtemp(join(env.RUNNER_TEMP ?? tmpdir(), "lenso-release-"));
  try {
    const tarballs = [];
    for (const [i, item] of selected.entries()) {
      const packageVersion = item.version ?? version;
      run("pnpm", ["--dir", item.dir, "build"]);
      run("pnpm", ["--dir", item.dir, "pack", "--out", join(temp, `${i}.tgz`)]);
      const tarball = join(temp, `${i}.tgz`);
      const listing = run("tar", ["-tzf", tarball]).split("\n");
      const manifest = JSON.parse(run("tar", ["-xOf", tarball, "package/package.json"]));
      const contents = Object.fromEntries(
        ["package/src/tokens.stylex.const.ts"]
          .filter((path) => listing.includes(path))
          .map((path) => [path, run("tar", ["-xOf", tarball, path])]),
      );
      validatePackage(manifest, listing, contents, item, packageVersion);
      tarballs.push({
        item,
        version: packageVersion,
        tarball,
        integrity: `sha512-${createHash("sha512")
          .update(await readFile(tarball))
          .digest("base64")}`,
      });
    }
    for (const entry of tarballs) {
      const existing = await metadata(entry.item.name);
      if (existing && shouldSkipExisting(existing, entry.version, entry.integrity, entry.item))
        continue;
      run("npm", [
        "publish",
        entry.tarball,
        "--access",
        "public",
        "--tag",
        "latest",
        "--provenance",
        "--ignore-scripts",
        `--registry=${registry}`,
      ]);
      await waitForPublication(entry.item, entry.version, entry.integrity);
    }
    for (const entry of tarballs) {
      await waitForPublication(entry.item, entry.version, entry.integrity);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publish().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
