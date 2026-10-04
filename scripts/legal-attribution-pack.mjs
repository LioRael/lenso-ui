// node scripts/legal-attribution-pack.mjs <fresh test-results directory> <read-only dependency checkout>
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readdir, readFile, symlink, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { legalPackages, validateLegalPackage } from "./legal-attribution.mjs";

assert.equal(process.versions.node.split(".")[0], "24", "Use the pinned Node 24 binary");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [outputArgument, providerArgument] = process.argv.slice(2);
assert(outputArgument && providerArgument, "Supply evidence directory and read-only provider");
const output = resolve(outputArgument);
const provider = resolve(providerArgument);
assert(output.startsWith(resolve(project, "test-results") + sep));
assert(!output.startsWith(provider + sep));
await mkdir(output, { recursive: true });
assert.deepEqual(await readdir(output), [], "Use a fresh evidence directory");
await cp(resolve(project, "pnpm-lock.yaml"), resolve(output, "pnpm-lock.yaml"));
const producer = resolve(output, "producer");
await mkdir(producer);
await cp(resolve(project, "third-party"), resolve(producer, "third-party"), { recursive: true });
await cp(resolve(project, "LICENSE"), resolve(producer, "LICENSE"));
await cp(resolve(project, "tsconfig.base.json"), resolve(producer, "tsconfig.base.json"));
await cp(resolve(project, "packages/standard"), resolve(producer, "packages/standard"), {
  recursive: true,
  filter: (path) => !path.includes(`${sep}node_modules`),
});
async function linkDependencies(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.name === "@lenso") continue;
    if (entry.name.startsWith("@") && entry.isDirectory())
      await linkDependencies(resolve(from, entry.name), resolve(to, entry.name));
    else await symlink(resolve(from, entry.name), resolve(to, entry.name));
  }
}
await linkDependencies(resolve(provider, "node_modules"), resolve(producer, "node_modules"));
for (const entry of legalPackages) {
  const target = resolve(producer, "packages", entry.directory);
  await cp(resolve(project, "packages", entry.directory), target, {
    recursive: true,
    filter: (path) => !path.includes(`${sep}node_modules`) && !path.includes(`${sep}dist`),
  });
  await linkDependencies(
    resolve(provider, "packages", entry.directory, "node_modules"),
    resolve(target, "node_modules"),
  );
}
await mkdir(resolve(producer, "node_modules/@lenso"), { recursive: true });
for (const entry of legalPackages)
  await symlink(
    resolve(producer, "packages", entry.directory),
    resolve(producer, "node_modules", entry.name),
  );
// This provider predates the workspace build-tool links; resolve its exact stored versions.
const toolManifest = JSON.parse(
  await readFile(resolve(producer, "packages/stylex-build/package.json"), "utf8"),
);
const store = resolve(provider, "node_modules/.pnpm");
const stored = await readdir(store);
for (const [name, version] of Object.entries(toolManifest.dependencies)) {
  const target = resolve(producer, "packages/stylex-build/node_modules", name);
  try {
    await readFile(resolve(target, "package.json"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const prefix = `${name.replace("/", "+")}@${version}`;
    const matches = stored.filter(
      (directory) => directory === prefix || directory.startsWith(`${prefix}_`),
    );
    assert.equal(matches.length, 1, `Need exactly one provider copy of ${name}@${version}`);
    await mkdir(dirname(target), { recursive: true });
    await symlink(resolve(store, matches[0], "node_modules", name), target);
  }
}
const results = [];
for (const entry of [legalPackages[2], legalPackages[1], legalPackages[0]]) {
  const cwd = resolve(producer, "packages", entry.directory);
  const env = {
    ...process.env,
    PATH: `${dirname(process.execPath)}:${resolve(cwd, "node_modules/.bin")}:${resolve(producer, "node_modules/.bin")}:${process.env.PATH}`,
  };
  const manifest = JSON.parse(await readFile(resolve(cwd, "package.json"), "utf8"));
  const build = execFileSync("/bin/sh", ["-c", manifest.scripts.build], {
    cwd,
    env,
    encoding: "utf8",
  });
  await writeFile(resolve(output, `${entry.directory}-build.log`), build);
  const packed = JSON.parse(
    execFileSync(
      process.execPath,
      [
        resolve(dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js"),
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        output,
      ],
      { cwd, env, encoding: "utf8" },
    ),
  )[0];
  const extraction = resolve(output, entry.directory);
  await mkdir(extraction);
  execFileSync("tar", ["-xzf", resolve(output, packed.filename), "-C", extraction]);
  const result = await validateLegalPackage(pathToFileURL(`${extraction}/package/`), entry);
  const filtered = resolve(output, `${entry.directory}-missing-notice.tgz`);
  execFileSync("tar", ["--exclude", `package/${entry.notice}`, "-czf", filtered, "package"], {
    cwd: extraction,
  });
  const negative = resolve(output, `${entry.directory}-missing-notice`);
  await mkdir(negative);
  execFileSync("tar", ["-xzf", filtered, "-C", negative]);
  await assert.rejects(
    validateLegalPackage(pathToFileURL(`${negative}/package/`), entry),
    /ENOENT/,
  );
  results.push({
    ...result,
    tarball: packed.filename,
    sha256: createHash("sha256")
      .update(await readFile(resolve(output, packed.filename)))
      .digest("hex"),
    packedFiles: packed.files.map((file) => file.path),
  });
}
await writeFile(
  resolve(output, "results.json"),
  JSON.stringify({ node: process.version, provider, results }, null, 2),
);
console.log(JSON.stringify(results, null, 2));
