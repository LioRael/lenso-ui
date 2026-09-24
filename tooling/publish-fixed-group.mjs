import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const packageDirs = ["tokens", "primitives", "ui"];
const releaseSha = process.env.LENSO_RELEASE_SHA;
if (!releaseSha || !/^[0-9a-f]{40}$/.test(releaseSha)) {
  throw new Error("LENSO_RELEASE_SHA must be the validated 40-character commit SHA");
}
if (exec("git", ["rev-parse", "HEAD"]) !== releaseSha) {
  throw new Error("release checkout does not match the validated commit");
}
if (exec("git", ["ls-remote", "origin", "refs/heads/main"]).split("\t")[0] !== releaseSha) {
  throw new Error("main has advanced since this release candidate was validated");
}

const manifests = packageDirs.map((dir) =>
  JSON.parse(readFileSync(`packages/${dir}/package.json`, "utf8")),
);
for (const [index, manifest] of manifests.entries()) {
  if (manifest.name !== `@lenso/${packageDirs[index]}`) {
    throw new Error(`packages/${packageDirs[index]} has an unexpected package name`);
  }
}
const versions = new Set(manifests.map((manifest) => manifest.version));
if (versions.size !== 1) {
  throw new Error("the public fixed-group package versions disagree");
}
const version = manifests[0].version;
const snapshot = JSON.parse(readFileSync(`apps/docs/public/r/v/${version}/release.json`, "utf8"));
if (snapshot.version !== version) {
  throw new Error(`registry snapshot does not match ${version}`);
}

const published = new Map();
for (const manifest of manifests) {
  const versions = JSON.parse(exec("npm", ["view", manifest.name, "versions", "--json"]));
  published.set(manifest.name, (Array.isArray(versions) ? versions : [versions]).includes(version));
}
const tarballs = new Map();
if ([...published.values()].some((value) => !value)) {
  execFileSync("pnpm", ["build:packages"], { stdio: "inherit" });
  const packDir = mkdtempSync(join(process.env.RUNNER_TEMP || tmpdir(), "lenso-release-"));
  for (const [index, manifest] of manifests.entries()) {
    const tarball = join(packDir, `${packageDirs[index]}-${version}.tgz`);
    execFileSync("pnpm", ["--dir", `packages/${packageDirs[index]}`, "pack", "--out", tarball], {
      stdio: "inherit",
    });
    const packed = JSON.parse(exec("tar", ["-xOf", tarball, "package/package.json"]));
    if (packed.name !== manifest.name || packed.version !== version) {
      throw new Error(`${tarball} has unexpected package identity`);
    }
    for (const specifier of Object.values({
      ...packed.dependencies,
      ...packed.peerDependencies,
      ...packed.optionalDependencies,
    })) {
      if (specifier.startsWith("workspace:") || specifier.startsWith("catalog:")) {
        throw new Error(`${tarball} contains an unresolved workspace dependency`);
      }
    }
    tarballs.set(manifest.name, tarball);
  }
}
for (const manifest of manifests) {
  if (!published.get(manifest.name)) {
    execFileSync(
      "npm",
      ["publish", tarballs.get(manifest.name), "--access", "public", "--provenance"],
      {
        stdio: "inherit",
      },
    );
  }
  const tag = `${manifest.name}@${version}`;
  if (!releaseExists(tag)) {
    execFileSync(
      "gh",
      [
        "release",
        "create",
        tag,
        "--target",
        releaseSha,
        "--title",
        tag,
        "--notes",
        `Published ${tag} from validated commit ${releaseSha}.`,
      ],
      { stdio: "inherit" },
    );
  }
}

function releaseExists(tag) {
  try {
    execFileSync("gh", ["release", "view", tag, "--json", "tagName"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function exec(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}
