#!/usr/bin/env node
import { cp, lstat, mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const version = "0.1.0";
const templateDir = fileURLToPath(new URL("../template/", import.meta.url));

function usage() {
  return `Create a Lenso Docs content project.

Usage: pnpm create lenso-docs <directory>

Options:
  -h, --help       Show this help
  -v, --version    Show the version`;
}

async function main(args) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log(usage());
    return;
  }
  if (args.length === 1 && (args[0] === "--version" || args[0] === "-v")) {
    console.log(version);
    return;
  }
  if (args.length !== 1 || args[0].startsWith("-")) {
    throw new Error(`Expected one project directory.\n\n${usage()}`);
  }

  const requested = args[0];
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
    target === path.resolve(process.env.HOME ?? "/")
  ) {
    throw new Error(
      "Refusing to use a filesystem root, home directory, or the current directory as the project target.",
    );
  }

  let entries;
  try {
    if (!(await lstat(target)).isDirectory())
      throw new Error(`Target is not a directory: ${target}`);
    entries = await readdir(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
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
  await writeFile(path.join(target, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
    flag: "wx",
  });
  console.log(`Created ${name} at ${target}`);
  console.log("Next: install dependencies, then run pnpm dev.");
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`create-lenso-docs: ${error.message}`);
  process.exitCode = 1;
});
