import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const fixedPackages = [
  ["@lenso/primitives", "packages/primitives/package.json"],
  ["@lenso/tokens", "packages/tokens/package.json"],
  ["@lenso/ui", "packages/ui/package.json"],
];

const releaseStatusFiles = [
  "README.md",
  "docs/architecture.md",
  "apps/docs/contents/start/release-status/content.mdx",
];

const slotStart = "lenso-release-slot:start";
const slotEnd = "lenso-release-slot:end";
const versionPattern = /\b\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\b/gu;

export async function checkReleaseStatus(root = process.cwd()) {
  const version = await readFixedGroupVersion(root);
  const stale = [];
  for (const path of releaseStatusFiles) {
    const source = await readFile(join(root, path), "utf8");
    if (renderReleaseSlots(source, version, path) !== source) {
      stale.push(path);
    }
  }
  if (stale.length > 0) {
    throw new Error(`release status is stale:\n${stale.join("\n")}`);
  }
  return version;
}

export async function writeReleaseStatus(root = process.cwd()) {
  const version = await readFixedGroupVersion(root);
  for (const path of releaseStatusFiles) {
    const file = join(root, path);
    const source = await readFile(file, "utf8");
    const rendered = renderReleaseSlots(source, version, path);
    if (rendered !== source) {
      await writeFile(file, rendered);
    }
  }
  return version;
}

async function readFixedGroupVersion(root) {
  const config = await readJson(join(root, ".changeset/config.json"));
  const expectedNames = fixedPackages.map(([name]) => name).sort();
  const hasExpectedFixedGroup = config.fixed?.some(
    (group) =>
      Array.isArray(group) &&
      group.length === expectedNames.length &&
      [...group].sort().every((name, index) => name === expectedNames[index]),
  );
  if (!hasExpectedFixedGroup) {
    throw new Error(`Changesets fixed group must contain exactly ${expectedNames.join(", ")}`);
  }

  const versions = [];
  for (const [expectedName, path] of fixedPackages) {
    const manifest = await readJson(join(root, path));
    if (manifest.name !== expectedName || typeof manifest.version !== "string") {
      throw new Error(`${path} does not describe ${expectedName} with a version`);
    }
    versions.push([expectedName, manifest.version]);
  }
  const uniqueVersions = new Set(versions.map(([, version]) => version));
  if (uniqueVersions.size !== 1) {
    throw new Error(
      `fixed-group package versions disagree: ${versions
        .map(([name, version]) => `${name}@${version}`)
        .join(", ")}`,
    );
  }
  return versions[0][1];
}

function renderReleaseSlots(source, version, path) {
  let inSlot = false;
  let slotCount = 0;
  let replacements = 0;
  const lines = source.split("\n").map((line) => {
    if (line.includes(slotStart)) {
      if (inSlot) {
        throw new Error(`${path} has nested release slots`);
      }
      inSlot = true;
      replacements = 0;
      slotCount += 1;
      return line;
    }
    if (line.includes(slotEnd)) {
      if (!inSlot) {
        throw new Error(`${path} has an unmatched release slot end`);
      }
      if (replacements === 0) {
        throw new Error(`${path} has an empty release slot`);
      }
      inSlot = false;
      return line;
    }
    if (!inSlot) {
      return line;
    }
    return line.replace(versionPattern, () => {
      replacements += 1;
      return version;
    });
  });
  if (inSlot) {
    throw new Error(`${path} has an unterminated release slot`);
  }
  if (slotCount === 0) {
    throw new Error(`${path} has no marked release slots`);
  }
  return lines.join("\n");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const write = process.argv.includes("--write");
  const check = process.argv.includes("--check");
  if (write === check) {
    throw new Error("use exactly one of --check or --write");
  }
  const version = write ? await writeReleaseStatus() : await checkReleaseStatus();
  console.log(
    write
      ? `Release-status slots updated to ${version}.`
      : `Release-status slots match ${version}.`,
  );
}
