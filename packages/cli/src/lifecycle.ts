import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateToolContract } from "./contract.ts";
import {
  checkProject,
  dependencies,
  integration,
  rootDirectory,
  fileAt,
  parsePackage,
  type ProjectPlan,
} from "./project.ts";

export type DependencyAction = "install" | "upgrade" | "uninstall";
export interface DependencyPlan extends ProjectPlan {
  action: DependencyAction;
}

const executeNode = promisify(execFile);
async function resolveEntry(specifier: string, directory: string): Promise<string> {
  // A fresh built-in resolver uses the consumer's ESM conditions without
  // importing its package code or loading caller-provided Node hooks.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key !== "NODE_OPTIONS" && key !== "NODE_PATH"),
  );
  const { stdout } = await executeNode(
    process.execPath,
    ["--input-type=module", "-e", "console.log(import.meta.resolve(process.argv[1]))", specifier],
    { cwd: directory, env, timeout: 5000, maxBuffer: 1024 * 1024 },
  );
  const url = new URL(stdout.trim());
  if (url.protocol !== "file:") throw new Error(`Package entry is not a local file: ${specifier}`);
  const file = fileURLToPath(url);
  if (!(await stat(file)).isFile()) throw new Error(`Missing runtime or asset file: ${specifier}`);
  return file;
}

export async function planDependencies(
  directory: string,
  action: DependencyAction,
  input: unknown,
): Promise<DependencyPlan> {
  if (!["install", "upgrade", "uninstall"].includes(action))
    throw new Error("Dependency action must be install, upgrade or uninstall");
  const contract = validateToolContract(input);
  const root = await rootDirectory(directory);
  const original = await fileAt(root, "package.json");
  if (original === null) throw new Error("Project needs package.json");
  const pkg = parsePackage(original);
  const desired = dependencies(contract);
  const conflicts: string[] = [];
  const managedLenso = new Set(["@lenso/ui", "@lenso/tokens", "@lenso/stylex-build"]);
  for (const section of ["dependencies", "devDependencies"] as const) {
    for (const [name, version] of Object.entries(desired[section])) {
      const locations = (["dependencies", "devDependencies"] as const).filter(
        (key) => pkg[key]?.[name] !== undefined,
      );
      if (action === "install") {
        for (const key of locations)
          if (pkg[key]?.[name] !== version)
            conflicts.push(
              `${key}.${name}: expected ${version}; received ${pkg[key]?.[name]}. Use upgrade after review.`,
            );
        if (!locations.length) pkg[section] = { ...pkg[section], [name]: version };
      } else {
        for (const key of locations) {
          const entries = pkg[key];
          if (!entries) continue;
          if (action === "upgrade") entries[name] = version;
          else if (managedLenso.has(name)) delete entries[name];
        }
      }
    }
  }
  const indent = original.match(/\n([ \t]+)"/)?.[1] ?? "  ";
  const after = JSON.stringify(pkg, null, indent) + (original.endsWith("\n") ? "\n" : "");
  const changes: ProjectPlan["changes"] = [];
  if (JSON.stringify(parsePackage(original)) !== JSON.stringify(pkg))
    changes.push({ file: "package.json", before: original, after });
  return {
    root,
    action,
    lensoVersion: contract.lensoVersion,
    digest: contract.digest,
    dryRun: true,
    changes,
    conflicts,
    manual: [
      "Review the plan, explicitly apply it, then run your consumer project's package manager to update its lockfile and installed dependencies. This tool never runs package-manager commands.",
      "A manifest edit is not a registry installation. Private or unpublished Lenso packages require an authorized local/workspace or registry source.",
      ...(action === "uninstall"
        ? [
            "Only managed Lenso dependency entries are removed. StyleX/runtime dependencies, scripts, configuration, generated files and application source are preserved.",
            "Review CSS and Lenso imports manually; remove or replace them and review your build configuration before building.",
          ]
        : [
            "Versions come only from this contract; no latest-version or network lookup is performed. Run check, typecheck and your framework build after package-manager installation.",
          ]),
    ],
  };
}

// The supported descriptor currently uses a pinned caret range. Unknown range
// syntax remains skipped rather than being optimistically declared compatible.
export function nodeCompatibility(version: string, range: string): boolean | null {
  const actual = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  const expected = /^(\^?)(\d+)\.(\d+)\.(\d+)$/.exec(range);
  if (!actual || !expected) return null;
  const major = Number(actual[1]);
  const minor = Number(actual[2]);
  const patch = Number(actual[3]);
  const targetMajor = Number(expected[2]);
  const targetMinor = Number(expected[3]);
  const targetPatch = Number(expected[4]);
  if (!expected[1]) return major === targetMajor && minor === targetMinor && patch === targetPatch;
  if (major !== targetMajor) return false;
  if (targetMajor === 0 && minor !== targetMinor) return false;
  if (targetMajor === 0 && targetMinor === 0) return patch === targetPatch;
  return minor > targetMinor || (minor === targetMinor && patch >= targetPatch);
}

export interface DoctorEvidence {
  kind: "static" | "environment" | "resolution";
  status: "pass" | "error" | "skipped";
  subject: string;
  message: string;
}

export type DoctorResult = Awaited<ReturnType<typeof checkProject>> & {
  evidence: DoctorEvidence[];
  automaticRepair: false;
};

export async function doctorProject(directory: string, input: unknown): Promise<DoctorResult> {
  const contract = validateToolContract(input);
  const root = await rootDirectory(directory);
  const check = await checkProject(root, contract);
  const evidence: DoctorEvidence[] = [
    {
      kind: "static",
      status: check.diagnostics.length ? "error" : check.skipped.length ? "skipped" : "pass",
      subject: "project",
      message:
        "Static source, manifest and configuration checks only; skipped analysis is not a passing verdict.",
    },
  ];
  const supported = nodeCompatibility(process.version, integration(contract).node.range);
  const diagnostics = [...check.diagnostics];
  const report = (ruleId: string, message: string) =>
    diagnostics.push({
      ruleId,
      severity: "error" as const,
      file: "package.json",
      line: 1,
      column: 1,
      message,
    });
  const nodeMessage = `Node ${process.version}; contract requires ${integration(contract).node.range}`;
  evidence.push({
    kind: "environment",
    status: supported === null ? "skipped" : supported ? "pass" : "error",
    subject: "node",
    message:
      supported === null ? `${nodeMessage}; range syntax cannot be checked locally` : nodeMessage,
  });
  if (supported === false) report("lenso/node-version", nodeMessage);
  const wanted = dependencies(contract);
  for (const [name, version] of Object.entries({
    ...wanted.dependencies,
    ...wanted.devDependencies,
  })) {
    try {
      const entry = await resolveEntry(name, root);
      let location = dirname(entry);
      let manifest: string;
      for (;;) {
        const candidate = join(location, "package.json");
        try {
          const value: unknown = JSON.parse(await readFile(candidate, "utf8"));
          if (value && typeof value === "object" && "name" in value && value.name === name) {
            manifest = candidate;
            break;
          }
        } catch {
          // An entry can be nested below the package manifest.
        }
        const parent = dirname(location);
        if (parent === location) throw new Error("Resolved entry has no matching package manifest");
        location = parent;
      }
      if (name === "@lenso/tokens") {
        await resolveEntry("@lenso/tokens/styles.css", root);
        await resolveEntry("@lenso/tokens/stylex-rules.json", root);
      }
      const value: unknown = JSON.parse(await readFile(manifest, "utf8"));
      if (
        !value ||
        typeof value !== "object" ||
        !("name" in value) ||
        value.name !== name ||
        !("version" in value) ||
        typeof value.version !== "string"
      )
        throw new Error("Resolved package manifest is invalid");
      const message = `${name}: resolved ESM entry ${entry}, version ${value.version}; contract expects ${version}${name === "@lenso/tokens" ? "; theme CSS and StyleX metadata files exist" : ""}`;
      evidence.push({
        kind: "resolution",
        status: value.version === version ? "pass" : "error",
        subject: name,
        message,
      });
      if (value.version !== version) report("lenso/resolved-version", message);
    } catch (error) {
      const message = `${name}: package resolution could not be verified (${error instanceof Error ? error.message : String(error)}). Run your package manager with an authorized package source, then rerun doctor.`;
      evidence.push({ kind: "resolution", status: "error", subject: name, message });
      report("lenso/package-resolution", message);
    }
  }
  return {
    ...check,
    diagnostics,
    evidence,
    automaticRepair: false,
    limits: [
      ...check.limits,
      "Doctor uses Node's default ESM resolution without executing package entries or custom loaders; it does not install, repair or certify browser/CSS/keyboard behavior.",
    ],
  };
}
