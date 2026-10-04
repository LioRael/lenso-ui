import { lstat, readdir, readFile, realpath, open, unlink } from "node:fs/promises";
import { resolve, join, relative, sep, dirname } from "node:path";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { checkDesignPolicy } from "../../../tooling/design-policy/index.mjs";
import { runtimeModuleReferenceDetails } from "../../../scripts/source-imports.mjs";
import { validateToolContract } from "./contract.mjs";

const hash = (text) => createHash("sha256").update(text).digest("hex");
const ignored = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage"]);
const isPagesRenderer = (filename) => /^(?:src\/)?pages\/(?!api\/)/.test(filename);
async function rootDirectory(cwd) {
  const root = resolve(cwd);
  if (!(await lstat(root)).isDirectory())
    throw new Error("Project cwd must be a real directory, not a symlink");
  return realpath(root);
}
async function fileAt(root, file) {
  if (file.startsWith("/") || file.split(/[\\/]/).some((part) => ["", ".", ".."].includes(part)))
    throw new Error(`Unsafe project path: ${file}`);
  const target = join(root, file);
  const rel = relative(root, target);
  if (rel.startsWith(`..${sep}`) || rel === "..") throw new Error(`Unsafe project path: ${file}`);
  let directory = root;
  for (const part of file.split("/").slice(0, -1)) {
    directory = join(directory, part);
    const stat = await lstat(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink())
      throw new Error(`Unsafe project directory: ${file}`);
  }
  try {
    const stat = await lstat(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)
      throw new Error(`Unsafe project file (not a single regular file): ${file}`);
    return await readFile(target, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
async function projectFiles(root) {
  const files = [];
  const skipped = [];
  async function visit(directory) {
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
        } else files.push({ filename, source: await fileAt(root, filename) });
      }
    }
  }
  await visit(root);
  return { files, skipped };
}

function integration(contract) {
  const descriptor = contract.compatibility;
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
    descriptor.next.customGlobalError !== "unsupported" ||
    !contract.packageVersions["@lenso/stylex-build"]
  )
    throw new Error(
      "Contract lacks the buildSupport compatibility descriptor; regenerate the production contract.",
    );
  return {
    package: "@lenso/stylex-build",
    version: contract.packageVersions["@lenso/stylex-build"],
    stylexVersion: descriptor.stylex.version,
    metadata: "@lenso/tokens/stylex-rules.json",
    themeCss: "@lenso/tokens/styles.css",
    next: descriptor.next,
    node: descriptor.node,
  };
}
function dependencies(contract) {
  const build = integration(contract);
  return {
    dependencies: {
      "@lenso/ui": contract.packageVersions["@lenso/ui"],
      "@lenso/tokens": contract.packageVersions["@lenso/tokens"],
      "@stylexjs/stylex": build.stylexVersion,
    },
    devDependencies: { [build.package]: build.version },
  };
}
export async function checkProject(cwd, input) {
  const contract = validateToolContract(input);
  const root = await rootDirectory(cwd);
  const source = await fileAt(root, "package.json");
  if (source === null) throw new Error("Project needs package.json");
  const pkg = JSON.parse(source);
  const scan = await projectFiles(root);
  const result = checkDesignPolicy({ files: scan.files, mode: "consumer" });
  const diagnostics = [...result.diagnostics];
  const report = (ruleId, message, file = "package.json") =>
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
  const next = pkg.dependencies?.next ?? pkg.devDependencies?.next;
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
    for (const { filename } of scan.files)
      if (/(?:^|\/)app\/global-error\.[cm]?[jt]sx?$/.test(filename))
        report(
          "lenso/next-global-error",
          "Custom App Router global-error is unsupported by this build adapter",
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
    let imports;
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

export async function planInit(cwd, framework, input) {
  const contract = validateToolContract(input);
  if (!["vite", "next"].includes(framework)) throw new Error("--framework must be vite or next");
  const root = await rootDirectory(cwd);
  const original = await fileAt(root, "package.json");
  if (original === null) throw new Error("Create a Vite/Next project with package.json first");
  const pkg = JSON.parse(original);
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg))
    throw new Error("Invalid package.json");
  const build = integration(contract);
  const desired = dependencies(contract);
  const conflicts = [];
  const changes = [];
  const manual = [];
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
    conflicts.push("Custom app/global-error is unsupported; use Next's built-in renderer");
  if (framework === "next" && scan.files.some(({ filename }) => isPagesRenderer(filename)))
    conflicts.push(
      "The descriptor supports App Router rendering only; preserve and review existing Pages Router files manually",
    );
  for (const section of ["dependencies", "devDependencies"]) {
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
    for (const command of ["dev", "build"]) {
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
  let state = {};
  if (stateText !== null) {
    try {
      state = JSON.parse(stateText);
    } catch {
      throw new Error("Invalid generated ownership record .lenso-init.json");
    }
    if (
      state.formatVersion !== 1 ||
      !/^[a-f0-9]{64}$/.test(state.digest) ||
      !state.files ||
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
  if (JSON.stringify(JSON.parse(original)) !== JSON.stringify(pkg))
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

export async function applyInit(plan) {
  if (plan.conflicts.length) return { ...plan, dryRun: false, applied: false };
  const root = await rootDirectory(plan.root);
  for (const change of plan.changes) {
    if ((await fileAt(root, change.file)) !== change.before)
      throw new Error(`${change.file} changed after planning; nothing was written`);
  }
  // Reserve all new paths first. A collision aborts before existing files are touched.
  const reserved = [];
  try {
    for (const change of plan.changes.filter((entry) => entry.before === null)) {
      const handle = await open(join(root, change.file), "wx", 0o644);
      reserved.push({ handle, change });
    }
  } catch (error) {
    for (const { handle, change } of reserved) {
      await handle.close();
      await unlink(join(root, change.file));
    }
    throw error;
  }
  const existing = [];
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
    if (!writing) for (const { change } of reserved) await unlink(join(root, change.file));
  }
  return { ...plan, dryRun: false, applied: true };
}
