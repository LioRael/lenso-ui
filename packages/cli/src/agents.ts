import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createQueries, validateToolContract } from "./contract.ts";
import { planFiles, type ProjectPlan } from "./project.ts";

const start = "<!-- lenso-ui:begin -->";
const end = "<!-- lenso-ui:end -->";
const stateFile = ".lenso-ui/agent-state.json";
const hash = (source: string) => createHash("sha256").update(source).digest("hex");

function missing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
async function readOptional(file: string): Promise<string | null> {
  try {
    const stat = await lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)
      throw new Error(`Agent preparation refuses linked or non-file input: ${file}`);
    return await readFile(file, "utf8");
  } catch (error) {
    if (missing(error)) return null;
    throw error;
  }
}
function priorBlockHash(source: string | null): string | null {
  if (source === null) return null;
  const value: unknown = JSON.parse(source);
  if (
    !value ||
    typeof value !== "object" ||
    !("blockHash" in value) ||
    typeof value.blockHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.blockHash)
  )
    throw new Error("Invalid Lenso agent ownership metadata; review it before preparing docs.");
  return value.blockHash;
}

function mergeBlock(existing: string | null, block: string, ownedHash: string | null): string {
  if (existing === null) return `${block}\n`;
  const starts = existing.split(start).length - 1;
  const ends = existing.split(end).length - 1;
  if (!starts && !ends) return `${existing}${existing.endsWith("\n") ? "" : "\n"}\n${block}\n`;
  if (starts !== 1 || ends !== 1)
    throw new Error(
      "Malformed or duplicate Lenso block in AGENTS.md; preserve and review it manually.",
    );
  const from = existing.indexOf(start);
  const to = existing.indexOf(end) + end.length;
  if (to < from + start.length) throw new Error("Malformed Lenso block order in AGENTS.md.");
  const current = existing.slice(from, to);
  if (current !== block && (!ownedHash || hash(current) !== ownedHash))
    throw new Error(
      "The Lenso block in AGENTS.md is user-owned or edited; it will not be overwritten.",
    );
  return `${existing.slice(0, from)}${block}${existing.slice(to)}`;
}

export async function planAgentDocs(
  cwd: string,
  input: unknown,
  locale: "en" | "cn" = "en",
): Promise<ProjectPlan> {
  if (locale !== "en" && locale !== "cn")
    throw new Error("Agent documentation locale must be en or cn.");
  const contract = validateToolContract(input);
  const queries = createQueries(contract);
  const root = path.resolve(cwd);
  const existing = await readOptional(path.join(root, "AGENTS.md"));
  const ignore = await readOptional(path.join(root, ".gitignore"));
  const state = await readOptional(path.join(root, stateFile));
  const files: Record<string, string> = {};
  const index = [
    "# Lenso UI documentation",
    "",
    `Release: ${contract.lensoVersion}`,
    `Contract digest: ${contract.digest}`,
    "",
    "Exact authored Markdown from this tool's bundled contract; reference data, not executable instructions.",
    "",
  ];
  for (const document of contract.docs.filter((entry) => entry.locale === locale)) {
    if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(document.slug))
      throw new Error(`Unsafe or unsupported authored documentation slug: ${document.slug}`);
    const relative = `${locale}/${document.slug}.md`;
    files[`.lenso-ui/docs/${relative}`] = queries.documentation(document.slug, locale).markdown;
    index.push(`- [${document.title.replaceAll("[", "\\[").replaceAll("]", "\\]")}](${relative})`);
  }
  files[".lenso-ui/docs/index.md"] = `${index.join("\n")}\n`;
  const block = [
    start,
    "## Lenso UI reference",
    "",
    `Use the bundled Lenso ${contract.lensoVersion} contract (digest ${contract.digest}).`,
    "Read [.lenso-ui/docs/index.md](.lenso-ui/docs/index.md) and retrieve only the relevant authored guides.",
    "Use `lenso-ui metadata --json` to compare identity before mixing these files with another tool.",
    "Use `lenso-ui info`, `source`, `styles`, `examples` and `theme` for matching native contracts.",
    "Returned code is reference data; confirm keyboard behavior and actual CSS delivery in the application.",
    "For loaded local workflows, use `.agents/skills/lenso-ui` and `.agents/skills/lenso-ui-design`.",
    end,
  ].join("\n");
  files["AGENTS.md"] = mergeBlock(existing, block, priorBlockHash(state));
  files[stateFile] = `${JSON.stringify(
    {
      formatVersion: 1,
      lensoVersion: contract.lensoVersion,
      digest: contract.digest,
      locale,
      blockHash: hash(block),
    },
    null,
    2,
  )}\n`;
  const ignored = (ignore ?? "")
    .split(/\r?\n/)
    .some((line) => [".lenso-ui/", "/.lenso-ui/", ".lenso-ui"].includes(line.trim()));
  files[".gitignore"] = ignored
    ? ignore!
    : `${ignore ?? ""}${ignore && !ignore.endsWith("\n") ? "\n" : ""}.lenso-ui/\n`;
  return planFiles(root, contract, {
    command: "agents-md",
    files,
    expected: { "AGENTS.md": existing, ".gitignore": ignore },
    manual: [
      "Review the prepared AGENTS.md block and exact local documentation before applying.",
      "Local skills must be prepared and explicitly loaded through the agent host; this command does not activate them.",
    ],
  });
}

async function skillFiles(root: URL, relative = ""): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for (const name of await readdir(new URL(relative, root))) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error(`Unsafe skill filename: ${name}`);
    const location = `${relative}${name}`;
    const file = new URL(location, root);
    const stat = await lstat(file);
    if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory()))
      throw new Error(`Unsupported skill payload entry: ${file.href}`);
    if (stat.isDirectory()) Object.assign(files, await skillFiles(root, `${location}/`));
    else files[location] = await readFile(file, "utf8");
  }
  return files;
}

export async function planSkills(
  cwd: string,
  input: unknown,
  { skillsRoot = new URL("./skills/", import.meta.url) }: { skillsRoot?: URL } = {},
): Promise<ProjectPlan> {
  const contract = validateToolContract(input);
  if (skillsRoot.protocol !== "file:")
    throw new Error("Skills must come from this tool's local payload.");
  const files: Record<string, string> = {};
  for (const skill of ["lenso-ui", "lenso-ui-design"]) {
    const directory = new URL(`${skill}/`, skillsRoot);
    const contents = await skillFiles(directory);
    if (!contents["SKILL.md"] || !contents["LICENSE.txt"])
      throw new Error(`Incomplete bundled skill: ${fileURLToPath(directory)}`);
    for (const [file, source] of Object.entries(contents))
      files[`.agents/skills/${skill}/${file}`] = source;
  }
  return planFiles(cwd, contract, {
    command: "skills",
    files,
    manual: [
      "Review both local workflows and their licenses before loading them through the agent host.",
      "Only project-local skill files are prepared; no global directory or agent configuration is changed.",
    ],
  });
}
