import { lstat, readdir, realpath, open, unlink, mkdir, rmdir } from "node:fs/promises";
import { resolve, join, relative, sep, dirname, isAbsolute } from "node:path";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { checkDesignPolicy, type Skipped } from "../../../tooling/design-policy/index.ts";
import { parseSource, runtimeModuleReferenceDetails } from "../../../scripts/source-imports.ts";
import { validateToolContract, type LensoContract } from "./contract.ts";

export interface ProjectPlan {
  root: string;
  lensoVersion: string;
  digest: string;
  dryRun: boolean;
  changes: { file: string; before: string | null; after: string }[];
  conflicts: string[];
  manual: string[];
}
type PackageData = Record<string, unknown> & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
export function parsePackage(source: string): PackageData {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid package.json");
  for (const key of ["dependencies", "devDependencies", "scripts"]) {
    const section = (value as Record<string, unknown>)[key];
    if (
      section !== undefined &&
      (!section ||
        typeof section !== "object" ||
        Array.isArray(section) ||
        Object.values(section).some((item: unknown) => typeof item !== "string"))
    )
      throw new Error(`Invalid package.json ${key}`);
  }
  return value as PackageData;
}
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const ignored = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage"]);
const isPagesRenderer = (filename: string) => /^(?:src\/)?pages\/(?!api\/)/.test(filename);
function usesPreparedNext(files: { filename: string; source: string }[], packageName: string) {
  return files.some(({ filename, source }) => {
    if (!/^next\.config\.[cm]?[jt]s$/.test(filename)) return false;
    let program: ReturnType<typeof parseSource>["program"];
    try {
      program = parseSource(source, filename).program;
    } catch {
      return false;
    }
    const bindings = new Set();
    for (const statement of program.body) {
      if (
        statement.type !== "ImportDeclaration" ||
        statement.source.value !== packageName ||
        statement.importKind === "type"
      )
        continue;
      for (const specifier of statement.specifiers) {
        if (
          specifier.type === "ImportSpecifier" &&
          specifier.importKind !== "type" &&
          (specifier.imported.type === "Identifier"
            ? specifier.imported.name
            : specifier.imported.value) === "prepareNext"
        )
          bindings.add(specifier.local.name);
      }
    }
    function called(value: unknown): boolean {
      if (!value || typeof value !== "object") return false;
      if (Array.isArray(value)) return value.some(called);
      const node = value as Record<string, unknown>;
      const callee = node["callee"];
      if (
        node["type"] === "CallExpression" &&
        callee &&
        typeof callee === "object" &&
        "type" in callee &&
        callee.type === "Identifier" &&
        "name" in callee &&
        typeof callee.name === "string" &&
        bindings.has(callee.name)
      )
        return true;
      return Object.values(value).some(called);
    }
    return called(program);
  });
}
export async function rootDirectory(cwd: string) {
  const root = resolve(cwd);
  if (!(await lstat(root)).isDirectory())
    throw new Error("Project cwd must be a real directory, not a symlink");
  return realpath(root);
}
export async function fileAt(root: string, file: string) {
  if (
    isAbsolute(file) ||
    file.includes("\\") ||
    file.split("/").some((part) => ["", ".", ".."].includes(part))
  )
    throw new Error(`Unsafe project path: ${file}`);
  const target = join(root, file);
  const rel = relative(root, target);
  if (rel.startsWith(`..${sep}`) || rel === "..") throw new Error(`Unsafe project path: ${file}`);
  let directory = root;
  for (const part of file.split("/").slice(0, -1)) {
    directory = join(directory, part);
    let stat: Awaited<ReturnType<typeof lstat>>;
    try {
      stat = await lstat(directory);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
      throw error;
    }
    if (!stat.isDirectory() || stat.isSymbolicLink())
      throw new Error(`Unsafe project directory: ${file}`);
  }
  try {
    const stat = await lstat(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)
      throw new Error(`Unsafe project file (not a single regular file): ${file}`);
    const handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const opened = await handle.stat();
      if (
        !opened.isFile() ||
        opened.nlink !== 1 ||
        opened.dev !== stat.dev ||
        opened.ino !== stat.ino
      )
        throw new Error(`Unsafe project file (changed while reading): ${file}`);
      return await handle.readFile("utf8");
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
async function projectFiles(root: string) {
  const files: { filename: string; source: string }[] = [];
  const skipped: Skipped[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const target = join(directory, entry.name);
      const filename = relative(root, target).split(sep).join("/");
      if (entry.isSymbolicLink()) {
        skipped.push({ file: filename, reason: "Symlink not read", ruleId: "lenso/project-path" });
      } else if (entry.isDirectory()) await visit(target);
      else if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) {
        const stat = await lstat(target);
        if (stat.size > 2_000_000) {
          skipped.push({
            file: filename,
            reason: "Source exceeds 2 MB",
            ruleId: "lenso/source-size",
          });
        } else {
          const source = await fileAt(root, filename);
          if (source !== null) files.push({ filename, source });
        }
      }
    }
  }
  await visit(root);
  return { files, skipped };
}

export function integration(contract: LensoContract) {
  const descriptor = contract.compatibility;
  const next = descriptor.next;
  const version = contract.packageVersions["@lenso/stylex-build"];
  const uiVersion = contract.packageVersions["@lenso/ui"];
  const tokensVersion = contract.packageVersions["@lenso/tokens"];
  const supportedErrorMode =
    next?.customGlobalError === "unsupported" ||
    (next?.customGlobalError === "explicit-css" &&
      next.explicitCss?.api === "prepareNext" &&
      next.explicitCss.mode === "production" &&
      next.explicitCss.watch === false &&
      next.explicitCss.cache === false &&
      next.legacyAssetRewrite?.customGlobalError === "unsupported" &&
      next.legacyAssetRewrite.version === next.version);
  if (
    descriptor.schemaVersion !== 1 ||
    typeof descriptor.stylex?.version !== "string" ||
    descriptor.stylex.metadataFormat !== "@lenso/stylex-build/raw-rules" ||
    descriptor.stylex.metadataVersion !== 1 ||
    typeof descriptor.node?.range !== "string" ||
    typeof descriptor.vite?.testedVersion !== "string" ||
    typeof descriptor.next?.version !== "string" ||
    descriptor.next.router !== "App Router" ||
    descriptor.next.bundler !== "Webpack" ||
    !supportedErrorMode ||
    !version ||
    !uiVersion ||
    !tokensVersion
  )
    throw new Error(
      "Contract lacks the buildSupport compatibility descriptor; regenerate the production contract.",
    );
  return {
    package: "@lenso/stylex-build",
    version,
    uiVersion,
    tokensVersion,
    stylexVersion: descriptor.stylex.version,
    metadata: "@lenso/tokens/stylex-rules.json",
    themeCss: "@lenso/tokens/styles.css",
    next: descriptor.next,
    node: descriptor.node,
  };
}
export function dependencies(contract: LensoContract) {
  const build = integration(contract);
  return {
    dependencies: {
      "@lenso/ui": build.uiVersion,
      "@lenso/tokens": build.tokensVersion,
      "@stylexjs/stylex": build.stylexVersion,
    },
    devDependencies: { [build.package]: build.version },
  };
}
export async function checkProject(cwd: string, input: unknown) {
  const contract = validateToolContract(input);
  const root = await rootDirectory(cwd);
  const source = await fileAt(root, "package.json");
  if (source === null) throw new Error("Project needs package.json");
  const pkg = parsePackage(source);
  const scan = await projectFiles(root);
  const result = checkDesignPolicy({ files: scan.files, mode: "consumer" });
  const diagnostics = [...result.diagnostics];
  const report = (ruleId: string, message: string, file = "package.json") =>
    diagnostics.push({ ruleId, severity: "error", file, line: 1, column: 1, message });
  const expected = dependencies(contract);
  for (const [name, version] of Object.entries({
    ...expected.dependencies,
    ...expected.devDependencies,
  })) {
    const declared = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
    if (declared !== version)
      report(
        "lenso/compatibility",
        `${name}: expected exact ${version}; received ${declared ?? "missing"}`,
      );
  }
  const build = integration(contract);
  const next = pkg.dependencies?.["next"] ?? pkg.devDependencies?.["next"];
  if (next && next !== build.next.version)
    report(
      "lenso/next-version",
      `Next support is pinned to ${build.next.version}; received ${next}`,
    );
  if (next) {
    if (scan.files.some(({ filename }) => isPagesRenderer(filename)))
      report(
        "lenso/next-router",
        "This build adapter supports App Router rendering, not Pages Router",
      );
    const preparedNext =
      build.next.explicitCss?.api === "prepareNext" &&
      build.next.explicitCss.mode === "production" &&
      usesPreparedNext(scan.files, build.package);
    for (const { filename } of scan.files)
      if (/(?:^|\/)app\/global-error\.[cm]?[jt]sx?$/.test(filename) && !preparedNext)
        report(
          "lenso/next-global-error",
          "Legacy automatic CSS delivery does not support custom global-error. Use the production prepareNext integration and import its generated CSS and theme in the error document.",
          filename,
        );
    for (const name of ["dev", "build"])
      if (!pkg.scripts?.[name]?.includes("--webpack"))
        report("lenso/next-webpack", `The ${name} script must use Next's supported Webpack build`);
  }
  const configs = scan.files.filter(({ filename }) => /^(vite|next)\.config\./.test(filename));
  if (!configs.length)
    report("lenso/build-config", "No Vite/Next config found; use init to review setup");
  const references = scan.files.map(({ source }) => source).join("\n");
  if (!references.includes(build.package) || !references.includes(build.metadata))
    report("lenso/build-config", `Config must seed ${build.package} from ${build.metadata}`);
  const themeHelper = await fileAt(root, "lenso.theme.css");
  let themeImported = false;
  for (const { filename, source } of scan.files) {
    let imports: ReturnType<typeof runtimeModuleReferenceDetails>;
    try {
      imports = runtimeModuleReferenceDetails(source, filename);
    } catch {
      continue; // Unresolved source is already reported by the shared policy checker.
    }
    if (
      imports.some(
        ({ module }) =>
          module === build.themeCss ||
          (module?.startsWith(".") &&
            themeHelper?.includes(build.themeCss) &&
            resolve(dirname(join(root, filename)), module) === join(root, "lenso.theme.css")),
      )
    ) {
      themeImported = true;
      break;
    }
  }
  if (!themeImported)
    report(
      "lenso/theme-css",
      `Import ${build.themeCss} in the rendering entry/layout of every document`,
    );
  return {
    lensoVersion: contract.lensoVersion,
    digest: contract.digest,
    mode: "consumer",
    diagnostics,
    skipped: [...scan.skipped, ...result.skipped],
    limits: [
      "Static config checks are hints, not proof of CSS delivery. Run your framework build and keyboard/browser checks.",
    ],
  };
}

export async function planInit(cwd: string, framework: "vite" | "next", input: unknown) {
  const contract = validateToolContract(input);
  if (!["vite", "next"].includes(framework)) throw new Error("--framework must be vite or next");
  const root = await rootDirectory(cwd);
  const original = await fileAt(root, "package.json");
  if (original === null) throw new Error("Create a Vite/Next project with package.json first");
  const pkg = parsePackage(original);
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg))
    throw new Error("Invalid package.json");
  const build = integration(contract);
  const desired = dependencies(contract);
  const conflicts: string[] = [];
  const changes: ProjectPlan["changes"] = [];
  const manual: string[] = [];
  const scan = await projectFiles(root);
  if (scan.skipped.length)
    conflicts.push(...scan.skipped.map((entry) => `${entry.file}: ${entry.reason}`));
  const frameworkVersion = pkg.dependencies?.[framework] ?? pkg.devDependencies?.[framework];
  if (!frameworkVersion)
    conflicts.push(
      `package.json must declare ${framework}; create a real ${framework} starter first`,
    );
  if (
    framework === "vite" &&
    !(pkg.devDependencies?.["@vitejs/plugin-react"] ?? pkg.dependencies?.["@vitejs/plugin-react"])
  )
    conflicts.push(
      "The generated React Vite config needs your starter's @vitejs/plugin-react dependency; preserve other plugin setups manually",
    );
  if (framework === "next" && frameworkVersion !== build.next.version)
    conflicts.push(
      `Next ${frameworkVersion} is unsupported; descriptor requires ${build.next.version}`,
    );
  if (
    framework === "next" &&
    scan.files.some(({ filename }) => /(?:^|\/)app\/global-error\./.test(filename))
  )
    conflicts.push(
      "Legacy init cannot configure custom app/global-error; use the production prepareNext integration with explicit CSS imports.",
    );
  if (framework === "next" && scan.files.some(({ filename }) => isPagesRenderer(filename)))
    conflicts.push(
      "The descriptor supports App Router rendering only; preserve and review existing Pages Router files manually",
    );
  for (const section of ["dependencies", "devDependencies"] as const) {
    if (pkg[section] && (typeof pkg[section] !== "object" || Array.isArray(pkg[section])))
      throw new Error(`Invalid package.json ${section}`);
    for (const [name, version] of Object.entries(desired[section])) {
      const declared = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
      if (declared && declared !== version)
        conflicts.push(`package.json: ${name} ${declared} → ${version}; review and pin manually`);
      else if (!declared) pkg[section] = { ...pkg[section], [name]: version };
    }
  }
  if (framework === "next") {
    for (const command of ["dev", "build"] as const) {
      const current = pkg.scripts?.[command];
      if (current === `next ${command}`)
        pkg.scripts = { ...pkg.scripts, [command]: `${current} --webpack` };
      else if (current !== `next ${command} --webpack`)
        conflicts.push(
          `package.json scripts.${command}: review complex command; use next ${command} --webpack`,
        );
    }
  }
  const marker = "// Generated by lenso-ui init. Change this file only after taking ownership.\n";
  const options = `metadata: [import.meta.resolve(${JSON.stringify(build.metadata)})],\n  unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname }`;
  const helper = `${marker}import stylex from ${JSON.stringify(build.package)};\nexport const lensoStylex = stylex.${framework === "vite" ? "vite" : "webpack"}({\n  ${options}\n});\n`;
  const configFile = framework === "vite" ? "vite.config.mjs" : "next.config.mjs";
  const config =
    framework === "vite"
      ? `${marker}import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport { lensoStylex } from "./lenso.stylex.mjs";\nexport default defineConfig({ plugins: [react(), lensoStylex] });\n`
      : `${marker}import { lensoStylex } from "./lenso.stylex.mjs";\nexport default {\n  webpack(config) {\n    config.cache = false;\n    config.plugins.push(lensoStylex);\n    return config;\n  },\n};\n`;
  const existingConfigs = scan.files.filter(({ filename }) =>
    new RegExp(`^${framework}\\.config\\.`).test(filename),
  );
  const stateText = await fileAt(root, ".lenso-init.json");
  let state: { formatVersion?: number; digest?: string; files?: Record<string, string> } = {};
  if (stateText !== null) {
    try {
      const value: unknown = JSON.parse(stateText);
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error("Invalid ownership record");
      state = value as typeof state;
    } catch {
      throw new Error("Invalid generated ownership record .lenso-init.json");
    }
    if (
      state.formatVersion !== 1 ||
      typeof state.digest !== "string" ||
      !/^[a-f0-9]{64}$/.test(state.digest) ||
      !state.files ||
      typeof state.files !== "object" ||
      Array.isArray(state.files) ||
      Object.keys(state).some((key) => !["formatVersion", "digest", "files"].includes(key)) ||
      Object.entries(state.files).some(
        ([file, value]) =>
          !["lenso.stylex.mjs", "lenso.theme.css", "vite.config.mjs", "next.config.mjs"].includes(
            file,
          ) ||
          typeof value !== "string" ||
          !/^[a-f0-9]{64}$/.test(value),
      )
    )
      throw new Error(
        "Unknown .lenso-init.json ownership format; refusing to overwrite user metadata",
      );
  }
  if (existingConfigs.some(({ filename }) => filename !== configFile))
    conflicts.push(
      `Existing ${existingConfigs.map(({ filename }) => filename).join(", ")} is user-owned. Keep it and manually import lensoStylex; proposed config:\n${config}`,
    );
  const generated = {
    "lenso.stylex.mjs": helper,
    "lenso.theme.css": `/* Generated by lenso-ui init. Import from each rendering entry/layout. */\n@import ${JSON.stringify(build.themeCss)};\n`,
    [configFile]: config,
  };
  for (const [file, after] of Object.entries(generated)) {
    const before = await fileAt(root, file);
    if (before === after) continue;
    if (before !== null && state.files?.[file] !== hash(before)) {
      conflicts.push(
        `${file} is user-owned or changed. Refusing overwrite.\n--- current\n${before}\n+++ proposed\n${after}`,
      );
      continue;
    }
    changes.push({ file, before, after });
  }
  const indent = original.match(/\n([ \t]+)"/)?.[1] ?? "  ";
  const afterPackage = JSON.stringify(pkg, null, indent) + (original.endsWith("\n") ? "\n" : "");
  if (JSON.stringify(parsePackage(original)) !== JSON.stringify(pkg))
    changes.push({ file: "package.json", before: original, after: afterPackage });
  const nextState =
    JSON.stringify(
      {
        formatVersion: 1,
        digest: contract.digest,
        files: Object.fromEntries(
          Object.entries(generated).map(([file, source]) => [file, hash(source)]),
        ),
      },
      null,
      2,
    ) + "\n";
  if (stateText !== nextState)
    changes.push({ file: ".lenso-init.json", before: stateText, after: nextState });
  manual.push(
    `Import ${JSON.stringify(build.themeCss)} from your ${framework === "vite" ? "application entry (for every HTML document)" : "rendering root layout in each App Router tree"}; existing application files are not rewritten.`,
  );
  manual.push(
    "Review the diff, install dependencies yourself, then run your typecheck, framework build and keyboard/focus tests.",
  );
  return {
    root,
    framework,
    lensoVersion: contract.lensoVersion,
    digest: contract.digest,
    dryRun: true,
    changes,
    conflicts,
    manual,
  };
}

export async function applyInit<T extends ProjectPlan>(plan: T) {
  if (plan.conflicts.length) return { ...plan, dryRun: false, applied: false };
  const root = await rootDirectory(plan.root);
  if (new Set(plan.changes.map((change) => change.file)).size !== plan.changes.length)
    throw new Error("Duplicate project paths in plan");
  for (const change of plan.changes) {
    if ((await fileAt(root, change.file)) !== change.before)
      throw new Error(`${change.file} changed after planning; nothing was written`);
  }
  // Reserve all new paths first. A collision aborts before existing files are touched.
  const reserved: {
    handle: Awaited<ReturnType<typeof open>>;
    change: ProjectPlan["changes"][number];
  }[] = [];
  const directories: string[] = [];
  try {
    for (const change of plan.changes) {
      let directory = root;
      for (const part of change.file.split("/").slice(0, -1)) {
        directory = join(directory, part);
        try {
          await mkdir(directory);
          directories.push(directory);
        } catch (error) {
          if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
        }
        const stat = await lstat(directory);
        if (!stat.isDirectory() || stat.isSymbolicLink())
          throw new Error(`Unsafe project directory: ${change.file}`);
      }
    }
    for (const change of plan.changes.filter((entry) => entry.before === null)) {
      const handle = await open(join(root, change.file), "wx", 0o644);
      reserved.push({ handle, change });
    }
  } catch (error) {
    for (const { handle, change } of reserved) {
      await handle.close();
      await unlink(join(root, change.file));
    }
    for (const directory of directories.reverse()) await rmdir(directory);
    throw error;
  }
  const existing: typeof reserved = [];
  let writing = false;
  try {
    for (const change of plan.changes.filter((entry) => entry.before !== null)) {
      const handle = await open(join(root, change.file), constants.O_RDWR | constants.O_NOFOLLOW);
      const stat = await handle.stat();
      const contents = await handle.readFile("utf8");
      if (!stat.isFile() || stat.nlink !== 1 || contents !== change.before) {
        await handle.close();
        throw new Error(`${change.file} changed after planning; refusing write`);
      }
      existing.push({ handle, change });
    }
    writing = true;
    for (const { handle, change } of [...reserved, ...existing]) {
      await handle.write(change.after, 0, "utf8");
      await handle.truncate(Buffer.byteLength(change.after));
      await handle.sync();
    }
  } finally {
    for (const { handle } of [...reserved, ...existing]) await handle.close();
    if (!writing) {
      for (const { change } of reserved) await unlink(join(root, change.file));
      for (const directory of directories.reverse()) await rmdir(directory);
    }
  }
  return { ...plan, dryRun: false, applied: true };
}

export const applyPlan = applyInit;

export interface PlanFilesOptions {
  files: Record<string, string>;
  manual?: string[];
  command?: string;
  /** Explicit preimages authorize caller-prepared merges of user-owned files. */
  expected?: Record<string, string | null>;
}

export async function planFiles(cwd: string, input: unknown, options: PlanFilesOptions) {
  const contract = validateToolContract(input);
  const root = await rootDirectory(cwd);
  const changes: ProjectPlan["changes"] = [];
  const conflicts: string[] = [];
  const stateFile = ".lenso-files.json";
  const stateText = await fileAt(root, stateFile);
  let owned: Record<string, string> = {};
  if (stateText !== null) {
    const state: unknown = JSON.parse(stateText);
    if (
      !state ||
      typeof state !== "object" ||
      Array.isArray(state) ||
      !("formatVersion" in state) ||
      state.formatVersion !== 1 ||
      !("files" in state) ||
      !state.files ||
      typeof state.files !== "object" ||
      Array.isArray(state.files) ||
      Object.keys(state).some((key) => !["formatVersion", "files"].includes(key)) ||
      Object.values(state.files).some(
        (value) => typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value),
      )
    )
      throw new Error("Invalid .lenso-files.json ownership record");
    owned = state.files as Record<string, string>;
    for (const file of Object.keys(owned)) await fileAt(root, file);
  }
  const nextOwned = { ...owned };
  for (const [file, after] of Object.entries(options.files)) {
    if (file === stateFile) throw new Error("Cannot replace the generated ownership record");
    const before = await fileAt(root, file);
    if (before === after) continue;
    const explicit = options.expected && Object.hasOwn(options.expected, file);
    if (explicit && options.expected?.[file] !== before)
      conflicts.push(`${file} changed before planning; refusing merge`);
    else if (before !== null && !explicit && owned[file] !== hash(before))
      conflicts.push(`${file} is user-owned or changed; refusing overwrite`);
    else {
      changes.push({ file, before, after });
      // A merged authored file stays user-owned; only generated files enter the record.
      if (!explicit || before === null) nextOwned[file] = hash(after);
      else delete nextOwned[file];
    }
  }
  const nextState = JSON.stringify({ formatVersion: 1, files: nextOwned }, null, 2) + "\n";
  if ((stateText !== null || Object.keys(nextOwned).length > 0) && nextState !== stateText)
    changes.push({ file: stateFile, before: stateText, after: nextState });
  return {
    root,
    lensoVersion: contract.lensoVersion,
    digest: contract.digest,
    dryRun: true,
    changes,
    conflicts,
    manual: options.manual ?? [],
    command: options.command,
  } satisfies ProjectPlan & { command?: string };
}
