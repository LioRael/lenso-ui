#!/usr/bin/env bun
import { cp, lstat, mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const version = "0.2.0";
const templateDir = fileURLToPath(new URL("../template/", import.meta.url));

function usage() {
  return `Create a Lenso Docs content project.

Usage: bun create lenso-docs <directory>

Options:
  -h, --help       Show this help
  -v, --version    Show the version
  --packages <directory>  Use local packed Lenso dependencies instead of registry versions`;
}

async function main(args: string[]) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log(usage());
    return;
  }
  if (args.length === 1 && (args[0] === "--version" || args[0] === "-v")) {
    console.log(version);
    return;
  }
  if (
    (args.length !== 1 && !(args.length === 3 && args[1] === "--packages")) ||
    args[0]!.startsWith("-")
  ) {
    throw new Error(`Expected one project directory.\n\n${usage()}`);
  }

  const localPackages: Record<string, string> = {};
  const packedFiles: string[] = [];
  const packagesDirectory = args[2] ? path.resolve(args[2]) : undefined;
  if (packagesDirectory) {
    const files = await readdir(packagesDirectory);
    for (const name of ["tokens", "glass", "primitives", "ui", "docs"]) {
      const matches = files.filter(
        (file) => file.startsWith(`lenso-${name}-`) && file.endsWith(".tgz"),
      );
      if (matches.length !== 1)
        throw new Error(`Expected one packed @lenso/${name} package in ${packagesDirectory}.`);
      packedFiles.push(matches[0]!);
      localPackages[`@lenso/${name}`] = `file:./.lenso-packages/${matches[0]}`;
    }
  }
  const requested = args[0]!;
  const name = path.basename(path.resolve(requested));
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || name === "." || name === "..") {
    throw new Error(
      "Directory name must use lowercase letters, numbers, dots, underscores, or hyphens.",
    );
  }
  const target = path.resolve(requested);
  const parent = path.dirname(target);
  if (
    target === path.parse(target).root ||
    target === process.cwd() ||
    target === path.resolve(process.env["HOME"] ?? "/")
  ) {
    throw new Error(
      "Refusing to use a filesystem root, home directory, or the current directory as the project target.",
    );
  }

  let entries: string[] | null;
  try {
    if (!(await lstat(target)).isDirectory())
      throw new Error(`Target is not a directory: ${target}`);
    entries = await readdir(target);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    await mkdir(parent, { recursive: true });
    entries = null;
  }
  if (entries?.length) throw new Error(`Target directory is not empty: ${target}`);
  if (entries) await rmdir(target);
  else await mkdir(parent, { recursive: true });
  await cp(templateDir, target, {
    recursive: true,
    errorOnExist: true,
    force: false,
    filter: (source) => path.resolve(source) !== path.join(templateDir, "package.json"),
  });
  await writeFile(path.join(target, ".gitignore"), await readFile(path.join(target, "gitignore")), {
    flag: "wx",
  });
  await rm(path.join(target, "gitignore"));
  const manifest = JSON.parse(await readFile(path.join(templateDir, "package.json"), "utf8"));
  manifest.name = name;
  if (packagesDirectory) {
    await mkdir(path.join(target, ".lenso-packages"));
    await Promise.all(
      packedFiles.map((file) =>
        cp(path.join(packagesDirectory, file), path.join(target, ".lenso-packages", file), {
          errorOnExist: true,
          force: false,
        }),
      ),
    );
    manifest.dependencies["@lenso/docs"] = localPackages["@lenso/docs"];
    manifest.overrides = localPackages;
  }
  await writeFile(path.join(target, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
    flag: "wx",
  });
  console.log(`Created ${name} at ${target}`);
  console.log(`Next:\n  cd ${JSON.stringify(target)}\n  bun install\n  bun run dev`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`create-lenso-docs: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
