import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

interface ReleasePackage {
  dir: string;
  name: string;
  kind: "tokens" | "glass" | "primitives" | "ui" | "docs" | "initializer";
  version?: string;
}
interface PackageManifest {
  name: string;
  version: string;
  private?: boolean;
  exports?: unknown;
  bin?: Record<string, string>;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
interface RegistryMetadata {
  versions?: Record<
    string,
    {
      version?: string | undefined;
      dist?: { integrity?: string };
      dependencies?: Record<string, string>;
    }
  >;
  "dist-tags"?: { latest?: string };
}
type ReleaseEnvironment = NodeJS.ProcessEnv & {
  GITHUB_ACTIONS?: string;
  GITHUB_REF?: string;
  GITHUB_SHA?: string;
  LENSO_RELEASE_VERSION?: string;
  RUNNER_TEMP?: string;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = "https://registry.npmjs.org/";
export const packages: ReleasePackage[] = [
  { dir: "packages/tokens", name: "@lenso/tokens", kind: "tokens" },
  { dir: "packages/glass", name: "@lenso/glass", kind: "glass", version: "0.1.1" },
  { dir: "packages/primitives", name: "@lenso/primitives", kind: "primitives", version: "0.8.0" },
  { dir: "packages/ui", name: "@lenso/ui", kind: "ui" },
  { dir: "packages/docs", name: "@lenso/docs", kind: "docs", version: "0.2.1" },
  { dir: "packages/create-docs", name: "create-lenso-docs", kind: "initializer", version: "0.2.1" },
];

export function validateContext(
  env: ReleaseEnvironment,
  head: string,
  remoteHead: string | undefined,
  manifests: PackageManifest[],
): string {
  if (env.GITHUB_ACTIONS !== "true") throw new Error("must run in GitHub Actions");
  if (env.GITHUB_REF !== "refs/heads/main") throw new Error("must run on refs/heads/main");
  if (!env.GITHUB_SHA || head !== env.GITHUB_SHA || remoteHead !== env.GITHUB_SHA) {
    throw new Error("checkout HEAD and origin/main must equal GITHUB_SHA");
  }
  const version = env.LENSO_RELEASE_VERSION;
  if (!version || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error("LENSO_RELEASE_VERSION must be canonical stable semver");
  }
  for (const [i, item] of packages.entries()) {
    if (
      manifests[i]?.name !== item.name ||
      manifests[i]?.private === true ||
      manifests[i]?.version !== (item.version ?? version)
    ) {
      throw new Error(`unexpected package identity or version in ${item.dir}`);
    }
  }
  return version;
}

export function validatePackage(
  manifest: PackageManifest,
  files: string[],
  contents: Record<string, string>,
  item: ReleasePackage,
  version: string,
  releaseVersion = version,
): void {
  if (manifest.name !== item.name || manifest.private === true || manifest.version !== version) {
    throw new Error(`unexpected package identity for ${item.name}`);
  }
  const names = new Set(files);
  const requireFile = (path: string) => {
    if (!names.has(path)) throw new Error(`${item.name} tarball missing ${path}`);
  };
  const resolveExport = (target: string) => {
    const path = `package/${target.replace(/^\.\//, "")}`;
    if (path.includes("*")) {
      const prefix = path.slice(0, path.indexOf("*"));
      const suffix = path.slice(path.indexOf("*") + 1);
      if (![...names].some((name) => name.startsWith(prefix) && name.endsWith(suffix))) {
        throw new Error(`${item.name} export does not resolve: ${target}`);
      }
    } else requireFile(path);
  };
  const walk = (value: unknown): void => {
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
    requireFile("package/dist/THIRD_PARTY_NOTICES.md");
    requireFile("package/dist/tokens.stylex.const.js");
    if (!contents["package/dist/tokens.stylex.const.js"])
      throw new Error("tokens declaration module is empty");
  } else if (item.kind === "glass") {
    for (const path of [
      "package/dist/index.js",
      "package/dist/index.d.ts",
      "package/dist/react/index.js",
      "package/dist/THIRD_PARTY_NOTICES.md",
      "package/dist/source/src/gpu-blur.ts",
      "package/dist/source/src/gpu-optics.ts",
      "package/dist/source/tsdown.config.ts",
    ])
      requireFile(path);
    if (manifest.dependencies?.["@lenso/tokens"] !== releaseVersion)
      throw new Error("@lenso/glass must depend on the released @lenso/tokens version");
    if (!/^["']use client["'];/.test(contents["package/dist/react/index.js"] ?? ""))
      throw new Error("@lenso/glass React entry must preserve its use client directive");
    if (!contents["package/dist/THIRD_PARTY_NOTICES.md"]?.includes("LGPL-2.0-or-later"))
      throw new Error("@lenso/glass must include its LGPL notice");
    for (const file of ["gpu-blur.ts", "gpu-optics.ts"])
      if (!contents[`package/dist/source/src/${file}`]?.includes("LGPL-2.0-or-later"))
        throw new Error(`@lenso/glass must include the attributed source ${file}`);
  } else if (item.kind === "primitives") {
    requireFile("package/LICENSE");
    requireFile("package/dist/sidebar/sidebar.js");
    requireFile("package/dist/sidebar/sidebar.d.ts");
    for (const family of ["sidebar"]) {
      requireFile(`package/dist/${family}/index.js`);
      requireFile(`package/dist/${family}/index.d.ts`);
      if (!/^["']use client["'];/.test(contents[`package/dist/${family}/index.js`] ?? ""))
        throw new Error(`${family} entry must preserve its use client directive`);
    }
  } else if (item.kind === "docs") {
    for (const path of [
      "package/LICENSE",
      "package/LICENSE.FUMADOCS",
      "package/NOTICE.md",
      "package/dist/fonts/Inter-Variable-OFL.txt",
      "package/dist/THIRD_PARTY_NOTICES.md",
    ])
      requireFile(path);
  } else if (item.kind === "initializer") {
    requireFile("package/LICENSE");
    requireFile("package/template/package.json");
  } else if (item.kind === "ui") {
    requireFile("package/dist/index.js");
    requireFile("package/dist/index.d.ts");
    requireFile("package/dist/THIRD_PARTY_NOTICES.md");
    if (
      manifest.dependencies?.["@lenso/glass"] !==
      packages.find((entry) => entry.kind === "glass")?.version
    )
      throw new Error("@lenso/ui must depend on the released @lenso/glass version");
    if (manifest.dependencies?.["@lenso/tokens"] !== releaseVersion) {
      throw new Error("@lenso/ui must depend on the released @lenso/tokens version");
    }
    if (
      manifest.dependencies?.["@lenso/primitives"] !==
      packages.find((entry) => entry.kind === "primitives")?.version
    )
      throw new Error("@lenso/ui must depend on the released @lenso/primitives version");
  }
  for (const dependency of packages) {
    const actual = manifest.dependencies?.[dependency.name];
    if (actual !== undefined && actual !== (dependency.version ?? releaseVersion))
      throw new Error(`${item.name} must depend on the released ${dependency.name} version`);
  }
}

export function shouldSkipExisting(
  metadata: RegistryMetadata | null,
  version: string,
  integrity: string,
  item: ReleasePackage,
  releaseVersion = version,
): boolean {
  const published = metadata?.versions?.[version];
  if (!published) return false;
  if (published.version !== version) {
    throw new Error(`registry version mismatch for ${item.name}@${version}`);
  }
  if (published.dist?.integrity !== integrity)
    throw new Error(`immutable version collision for ${item.name}@${version}`);
  if (
    (item.kind === "ui" || item.kind === "glass") &&
    published.dependencies?.["@lenso/tokens"] !== releaseVersion
  ) {
    throw new Error(`registry dependency mismatch for ${item.name}@${version}`);
  }
  if (
    item.kind === "ui" &&
    published.dependencies?.["@lenso/glass"] !==
      packages.find((entry) => entry.kind === "glass")?.version
  )
    throw new Error(`registry dependency mismatch for ${item.name}@${version}`);
  if (
    item.kind === "ui" &&
    published.dependencies?.["@lenso/primitives"] !==
      packages.find((entry) => entry.kind === "primitives")?.version
  )
    throw new Error(`registry dependency mismatch for ${item.name}@${version}`);
  return true;
}

export async function waitForPublication(
  item: ReleasePackage,
  version: string,
  integrity: string,
  {
    readMetadata = metadata,
    sleep = delay,
    now = Date.now,
    timeoutMs = 600_000,
    intervalMs = 5_000,
    log = console.log,
    releaseVersion = version,
  }: {
    readMetadata?: (name: string, timeoutMs: number) => Promise<RegistryMetadata | null>;
    sleep?: (milliseconds: number) => Promise<unknown>;
    now?: () => number;
    timeoutMs?: number;
    intervalMs?: number;
    log?: (message: string) => void;
    releaseVersion?: string;
  } = {},
) {
  const deadline = now() + timeoutMs;
  let announced = false;
  while (now() < deadline) {
    const published = await readMetadata(item.name, Math.min(15_000, deadline - now()));
    if (
      shouldSkipExisting(published, version, integrity, item, releaseVersion) &&
      published?.["dist-tags"]?.latest === version
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

function run(command: string, args: string[]): string {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

async function metadata(name: string, timeoutMs = 15_000): Promise<RegistryMetadata | null> {
  const response = await fetch(new URL(encodeURIComponent(name), registry), {
    headers: { "cache-control": "no-cache" },
    signal: AbortSignal.timeout(Math.max(1, timeoutMs)),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`registry metadata request failed: HTTP ${response.status}`);
  return response.json() as Promise<RegistryMetadata>;
}

async function publish() {
  const env = process.env;
  const head = run("git", ["rev-parse", "HEAD"]);
  const remoteHead = run("git", ["ls-remote", "origin", "refs/heads/main"]).split(/\s/)[0];
  const manifests = await Promise.all(
    packages.map(async (item) =>
      JSON.parse(await readFile(join(root, item.dir, "package.json"), "utf8")),
    ),
  );
  const version = validateContext(env, head, remoteHead, manifests);
  const temp = await mkdtemp(join(env["RUNNER_TEMP"] ?? tmpdir(), "lenso-release-"));
  try {
    // One dependency graph: shared dependencies build once, before packing any package.
    run("bunx", ["turbo", "run", "build", ...packages.map((item) => `--filter=${item.name}`)]);
    const tarballs = [];
    for (const [i, item] of packages.entries()) {
      const packageVersion = item.version ?? version;
      run("bun", ["pm", "pack", "--cwd", item.dir, "--filename", join(temp, `${i}.tgz`)]);
      const tarball = join(temp, `${i}.tgz`);
      const listing = run("tar", ["-tzf", tarball]).split("\n");
      const manifest = JSON.parse(run("tar", ["-xOf", tarball, "package/package.json"]));
      const contents = Object.fromEntries(
        [
          "package/dist/tokens.stylex.const.js",
          "package/dist/THIRD_PARTY_NOTICES.md",
          "package/dist/react/index.js",
          ...["sidebar"].map((family) => `package/dist/${family}/index.js`),
          "package/dist/source/src/gpu-blur.ts",
          "package/dist/source/src/gpu-optics.ts",
        ]
          .filter((path) => listing.includes(path))
          .map((path) => [
            path,
            execFileSync("tar", ["-xOf", tarball, path], { cwd: root, encoding: "utf8" }),
          ]),
      );
      validatePackage(manifest, listing, contents, item, packageVersion, version);
      if (item.kind === "glass") {
        for (const [packed, source] of [
          ["package/dist/THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
          ["package/dist/source/src/gpu-blur.ts", "packages/glass/src/gpu-blur.ts"],
          ["package/dist/source/src/gpu-optics.ts", "packages/glass/src/gpu-optics.ts"],
        ] as const) {
          if (contents[packed] !== (await readFile(join(root, source), "utf8")))
            throw new Error(`@lenso/glass packed ${packed} differs from source`);
        }
      }
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
      if (
        existing &&
        shouldSkipExisting(existing, entry.version, entry.integrity, entry.item, version)
      )
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
      await waitForPublication(entry.item, entry.version, entry.integrity, {
        releaseVersion: version,
      });
    }
    for (const entry of tarballs) {
      await waitForPublication(entry.item, entry.version, entry.integrity, {
        releaseVersion: version,
      });
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publish().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
