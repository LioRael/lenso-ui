import { createQueries, readContract } from "./contract.mjs";
import { checkProject, planInit, applyInit } from "./project.mjs";
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";

export const help = `lenso — version-matched Lenso developer tools

Usage:
  lenso list [--json]
  lenso info <component> [--json]
  lenso docs <slug/component> [--locale en|cn]
  lenso metadata [--json]
  lenso check [--cwd <project>] [--json]
  lenso init --framework vite|next [--cwd <project>] [--write] [--json]

init is a dry run unless --write is supplied. It never installs dependencies
or executes project scripts. check reads the consumer project without changing it.
Canonical names come from list; Menu is the public native menu family.
`;

function parse(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};
  const positional = [];
  const allowed = {
    list: ["json"],
    info: ["json"],
    docs: ["locale"],
    metadata: ["json"],
    check: ["cwd", "json"],
    init: ["framework", "cwd", "json", "write"],
    help: [],
  };
  if (!Object.hasOwn(allowed, command)) throw new Error(`Unknown command: ${command}`);
  for (let index = 0; index < rest.length; index++) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const name = token.slice(2);
    if (!allowed[command].includes(name) || Object.hasOwn(options, name))
      throw new Error(`Unknown or repeated option: ${token}`);
    if (["json", "write"].includes(name)) options[name] = true;
    else {
      const value = rest[++index];
      if (!value || value.startsWith("--")) throw new Error(`${token} needs a value`);
      options[name] = value;
    }
  }
  const count = ["info", "docs"].includes(command) ? 1 : 0;
  if (positional.length !== count) throw new Error(`${command} requires ${count} argument(s)`);
  return { command, options, name: positional[0] };
}

export async function run(argv, contract, cwd = process.cwd()) {
  if (argv.length === 0 || ["--help", "-h", "help"].includes(argv[0]))
    return { output: help, exitCode: 0 };
  const { command, options, name } = parse(argv);
  const queries = ["check", "init"].includes(command) ? undefined : createQueries(contract);
  let data;
  let exitCode = 0;
  switch (command) {
    case "list":
      data = queries.list();
      break;
    case "info":
      data = queries.api(name);
      break;
    case "metadata":
      data = queries.metadata();
      break;
    case "docs":
      return { output: queries.documentation(name, options.locale).markdown, exitCode: 0 };
    case "check":
      data = await checkProject(options.cwd ?? cwd, contract);
      exitCode = data.diagnostics.length || data.skipped.length ? 1 : 0;
      break;
    case "init":
      data = await planInit(options.cwd ?? cwd, options.framework, contract);
      if (options.write) data = await applyInit(data);
      exitCode = data.conflicts.length ? 1 : 0;
      break;
  }
  return {
    output:
      options.json || command !== "list"
        ? JSON.stringify(data, null, 2) + "\n"
        : data.map((entry) => `${entry.slug}\t${entry.parts.join(", ")}`).join("\n") + "\n",
    exitCode,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    const argv = process.argv.slice(2);
    const contract =
      argv.length === 0 || ["--help", "-h", "help"].includes(argv[0])
        ? undefined
        : readContract(new URL("./lenso-contract.json", import.meta.url));
    const result = await run(argv, contract);
    process.stdout.write(result.output);
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(`[lenso] ${error.message}`);
    process.exitCode = 1;
  }
}
