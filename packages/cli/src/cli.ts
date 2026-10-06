import { createQueries, readContract } from "./contract.ts";
import { checkProject, planInit, applyInit, applyPlan } from "./project.ts";
import { doctorProject, planDependencies } from "./lifecycle.ts";
import { planAgentDocs, planSkills } from "./agents.ts";
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";

export const help = `lenso-ui — version-matched Lenso developer tools

Usage:
  lenso-ui list [--json]
  lenso-ui info <component> [--json]
  lenso-ui docs <slug/component> [--locale en|cn]
  lenso-ui source <component> [--json]
  lenso-ui styles <component> [--json]
  lenso-ui examples <component> [--locale en|cn] [--json]
  lenso-ui theme [--json]
  lenso-ui search <query> [--locale en|cn] [--limit 1..50] [--json]
  lenso-ui metadata [--json]
  lenso-ui check [--cwd <project>] [--json]
  lenso-ui doctor [--cwd <project>] [--json]
  lenso-ui init --framework vite|next [--cwd <project>] [--write] [--json]
  lenso-ui install|upgrade|uninstall [--cwd <project>] [--write] [--json]
  lenso-ui agents-md [--cwd <project>] [--locale en|cn] [--write] [--json]
  lenso-ui skills [--cwd <project>] [--write] [--json]

All changes are dry-run plans unless --write is supplied. Dependency commands
edit the manifest only; they never execute a package manager or project scripts.
Tools and packages are private candidates, not currently registry-installable.
check/doctor report static evidence, not browser certification.
Canonical names come from list; Menu is the public native menu family.
`;

const allowed = {
  list: ["json"],
  info: ["json"],
  docs: ["locale"],
  source: ["json"],
  styles: ["json"],
  examples: ["json", "locale"],
  theme: ["json"],
  search: ["json", "locale", "limit"],
  metadata: ["json"],
  check: ["cwd", "json"],
  doctor: ["cwd", "json"],
  init: ["framework", "cwd", "json", "write"],
  install: ["cwd", "json", "write"],
  upgrade: ["cwd", "json", "write"],
  uninstall: ["cwd", "json", "write"],
  "agents-md": ["cwd", "locale", "json", "write"],
  skills: ["cwd", "json", "write"],
  help: [],
} as const;
type Command = keyof typeof allowed;
interface Options {
  json?: boolean;
  write?: boolean;
  locale?: "en" | "cn";
  framework?: "vite" | "next";
  cwd?: string;
  limit?: number;
}
function isCommand(value: string): value is Command {
  return Object.hasOwn(allowed, value);
}

function parse(argv: readonly string[]): { command: Command; options: Options; name?: string } {
  const [command = "help", ...rest] = argv;
  const options: Options = {};
  const positional: string[] = [];
  if (!isCommand(command)) throw new Error(`Unknown command: ${command}`);
  const flags = new Set<string>(allowed[command]);
  for (let index = 0; index < rest.length; index++) {
    const token = rest[index]!;
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const name = token.slice(2);
    if (!flags.has(name) || Object.hasOwn(options, name))
      throw new Error(`Unknown or repeated option: ${token}`);
    if (name === "json") options.json = true;
    else if (name === "write") options.write = true;
    else {
      const value = rest[++index];
      if (!value || value.startsWith("--")) throw new Error(`${token} needs a value`);
      switch (name) {
        case "cwd":
          options.cwd = value;
          break;
        case "locale":
          if (value !== "en" && value !== "cn") throw new Error("locale must be en or cn");
          options.locale = value;
          break;
        case "framework":
          if (value !== "vite" && value !== "next")
            throw new Error("framework must be vite or next");
          options.framework = value;
          break;
        case "limit":
          if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 50)
            throw new Error("limit must be an integer from 1 to 50");
          options.limit = Number(value);
          break;
        default:
          throw new Error(`Unknown option: ${token}`);
      }
    }
  }
  const count = ["info", "docs", "source", "styles", "examples", "search"].includes(command)
    ? 1
    : 0;
  if (positional.length !== count) throw new Error(`${command} requires ${count} argument(s)`);
  return { command, options, name: positional[0] };
}

export async function run(
  argv: readonly string[],
  contract: unknown,
  cwd = process.cwd(),
): Promise<{ output: string; exitCode: number }> {
  if (argv.length === 0 || ["--help", "-h", "help"].includes(argv[0] ?? ""))
    return { output: help, exitCode: 0 };
  const { command, options, name } = parse(argv);
  const queries = createQueries(contract);
  const argument = name ?? "";
  const directory = options.cwd ?? cwd;
  let data: unknown;
  let exitCode = 0;
  switch (command) {
    case "list":
      data = queries.list();
      break;
    case "info":
      data = queries.api(argument);
      break;
    case "metadata":
      data = queries.metadata();
      break;
    case "docs":
      return { output: queries.documentation(argument, options.locale).markdown, exitCode: 0 };
    case "source":
      data = { metadata: queries.metadata(), data: queries.source(argument) };
      break;
    case "styles":
      data = { metadata: queries.metadata(), data: queries.styles(argument) };
      break;
    case "examples":
      data = { metadata: queries.metadata(), data: queries.examples(argument, options.locale) };
      break;
    case "theme":
      data = { metadata: queries.metadata(), data: queries.theme() };
      break;
    case "search":
      data = {
        metadata: queries.metadata(),
        data: queries.search(argument, options.locale, options.limit),
      };
      break;
    case "check":
      {
        const report = await checkProject(directory, contract);
        data = report;
        exitCode = report.diagnostics.length || report.skipped.length ? 1 : 0;
      }
      break;
    case "doctor": {
      const report = await doctorProject(directory, contract);
      data = report;
      exitCode =
        report.diagnostics.length ||
        report.skipped.length ||
        report.evidence.some((entry) => entry.status !== "pass")
          ? 1
          : 0;
      break;
    }
    case "init":
      {
        if (!options.framework) throw new Error("init requires --framework vite or next");
        const plan = await planInit(directory, options.framework, contract);
        const result = options.write ? await applyInit(plan) : plan;
        data = result;
        exitCode = result.conflicts.length ? 1 : 0;
      }
      break;
    case "install":
    case "upgrade":
    case "uninstall": {
      const plan = await planDependencies(directory, command, contract);
      const result = options.write ? await applyPlan(plan) : plan;
      data = result;
      exitCode = result.conflicts.length ? 1 : 0;
      break;
    }
    case "agents-md":
    case "skills": {
      const plan =
        command === "agents-md"
          ? await planAgentDocs(directory, contract, options.locale)
          : await planSkills(directory, contract);
      const result = options.write ? await applyPlan(plan) : plan;
      data = result;
      exitCode = result.conflicts.length ? 1 : 0;
      break;
    }
    case "help":
      return { output: help, exitCode: 0 };
  }
  return {
    output:
      options.json || command !== "list"
        ? JSON.stringify(data, null, 2) + "\n"
        : queries
            .list()
            .map((entry) => `${entry.slug}\t${entry.parts.join(", ")}`)
            .join("\n") + "\n",
    exitCode,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    const argv = process.argv.slice(2);
    const contract =
      argv.length === 0 || ["--help", "-h", "help"].includes(argv[0] ?? "")
        ? undefined
        : readContract(new URL("./lenso-contract.json", import.meta.url));
    const result = await run(argv, contract);
    process.stdout.write(result.output);
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(`[lenso-ui] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
