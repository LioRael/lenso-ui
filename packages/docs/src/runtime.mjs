import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { watch } from "node:fs";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createSearchAPI } from "fumadocs-core/search/server";
import { defineDocs, loadConfig } from "./config.mjs";
import { loadHost, localPath, routePath } from "./host.mjs";
import { generateHost } from "./generate-host.mjs";
import { serve } from "./serve.mjs";

const require = createRequire(import.meta.url);
const source = path.dirname(fileURLToPath(import.meta.url));
const marker = ".lenso-owned";
const runtimePackages = [
  "@lenso/docs",
  "next",
  "react",
  "react-dom",
  "fumadocs-ui",
  "fumadocs-core",
  "typescript",
  "@types/node",
  "@types/react",
  "@types/react-dom",
];

async function exists(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

async function turbopackWorkspaceRoot(root) {
  // Workspace links resolve into the shared dependency store above a starter.
  // Installed consumers keep their own project root and node_modules boundary.
  let directory = source;
  while (path.dirname(directory) !== directory) {
    const relative = path.relative(directory, root);
    if (
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative) &&
      (await exists(path.join(directory, "pnpm-workspace.yaml")))
    )
      return directory;
    directory = path.dirname(directory);
  }
  return root;
}

async function ownedDirectory(directory) {
  const info = await exists(directory);
  if (info?.isSymbolicLink() || (info && !info.isDirectory()))
    throw new Error(`Refusing to write to ${directory}: expected a regular generated directory.`);
  if (info && (await readdir(directory)).length) {
    const markerFile = path.join(directory, marker);
    const markerInfo = await exists(markerFile);
    if (
      !markerInfo?.isFile() ||
      markerInfo.isSymbolicLink() ||
      (await readFile(markerFile, "utf8")) !== "lenso-docs\n"
    )
      throw new Error(`Refusing to overwrite ${directory}; it is not owned by lenso-docs.`);
  }
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, marker), "lenso-docs\n");
}

async function generatedParents(directory) {
  if (path.basename(directory) !== ".lenso") await generatedParents(path.dirname(directory));
  const info = await exists(directory);
  if (info) {
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new Error(`Generated directory cannot be a symlink or file: ${directory}`);
    return;
  }
  await mkdir(directory);
}

async function writeChanged(file, content) {
  await generatedParents(path.dirname(file));
  const info = await exists(file);
  if (info) {
    if (!info.isFile() || info.isSymbolicLink())
      throw new Error(`Generated file cannot be a symlink or directory: ${file}`);
    if ((await readFile(file)).equals(Buffer.from(content))) return;
  }
  const staged = `${file}.${randomUUID()}.pending`;
  try {
    await writeFile(staged, content, { flag: "wx" });
    await rename(staged, file);
  } finally {
    await rm(staged, { force: true });
  }
}

async function linkPackages(directory) {
  for (const name of runtimePackages) {
    const packageRoot = path.dirname(require.resolve(`${name}/package.json`));
    const target = path.join(directory, "node_modules", name);
    await generatedParents(path.dirname(target));
    const info = await exists(target);
    if (info) {
      if ((await realpath(target)) === (await realpath(packageRoot))) continue;
      if (!info.isSymbolicLink()) throw new Error(`Unexpected generated dependency: ${target}`);
      await rm(target);
    }
    await symlink(packageRoot, target, process.platform === "win32" ? "junction" : "dir");
  }
}

function scriptJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028");
}

async function validatePublic(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Public assets cannot be symlinks: ${file}`);
    if (entry.isDirectory()) await validatePublic(file);
  }
}

async function generatedFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`Generated source cannot be a symlink: ${relative}`);
    if (entry.isDirectory())
      files.push(...(await generatedFiles(path.join(directory, entry.name), relative)));
    else files.push(relative);
  }
  return files;
}

async function removeAssetMirror(publicRoot, files) {
  for (const relative of files) {
    const file = path.join(publicRoot, relative);
    await rm(file, { force: true });
    for (let folder = path.dirname(file); folder !== publicRoot; folder = path.dirname(folder)) {
      if ((await exists(folder)) && !(await readdir(folder)).length)
        await rm(folder, { recursive: true });
    }
  }
}

export async function prepare(
  root,
  {
    development = false,
    command = development ? "dev" : "build",
    previous,
    changedPaths = [],
    background = true,
    turbopack = false,
  } = {},
) {
  root = path.resolve(root);
  const config = await loadConfig(root);
  const host = await loadHost(root, config, command, {
    previous: previous?.host,
    changedPaths,
    background,
  });
  const directory = path.join(root, ".lenso");
  await ownedDirectory(directory);
  await linkPackages(directory);
  await writeChanged(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "lenso-docs-runtime", private: true, type: "module" }),
  );
  const emitted = new Set();
  const modules = new Map();
  const searchRevision = createHash("sha256");
  searchRevision.update(
    JSON.stringify(
      host.pages.map(({ id, url, title, description, markdown, structuredData }) => [
        id,
        url,
        title,
        description,
        markdown,
        structuredData,
      ]),
    ),
  );
  for (const [locale, file] of Object.entries(host.searchFiles).sort()) {
    searchRevision.update(locale);
    searchRevision.update(await readFile(file));
  }
  host.searchRevision = searchRevision.digest("hex");
  await generateHost(root, directory, config, host, {
    development,
    source,
    turbopackRoot: turbopack ? await turbopackWorkspaceRoot(root) : root,
    write: async (file, content) => {
      emitted.add(path.relative(directory, file));
      modules.set(file, content);
    },
  });
  const watchPaths = new Set(host.watchPaths);
  for (const relative of ["components", "root", "build"]) {
    if (config[relative]) {
      await localPath(root, config[relative]);
      watchPaths.add(config[relative]);
    }
  }
  for (const relative of config.styles ?? []) watchPaths.add(relative);
  for (const name of ["babel.config.json", "postcss.config.cjs"]) {
    const original = path.join(root, name);
    const staged = path.join(directory, name);
    if (!(development && turbopack && name === "babel.config.json") && (await exists(original))) {
      await localPath(root, name);
      watchPaths.add(name);
      await writeChanged(
        staged,
        name === "postcss.config.cjs"
          ? // Bundled __dirname/require.resolve are virtual Turbopack paths.
            // Keep authored PostCSS config evaluation native for real FS inputs.
            `module.exports = require("node:module").createRequire(${scriptJson(original)})(${scriptJson(original)});\n`
          : await readFile(original, "utf8"),
      );
    } else if (await exists(staged)) {
      const info = await lstat(staged);
      if (info.isSymbolicLink() || !info.isFile())
        throw new Error(`Generated helper cannot be a symlink or directory: ${staged}`);
      await rm(staged);
    }
  }
  const publicRoot = path.join(directory, "public");
  if (await exists(publicRoot)) {
    if ((await lstat(publicRoot)).isSymbolicLink())
      throw new Error("Generated public cannot be a symlink.");
    if (!previous) await validatePublic(publicRoot);
  }
  if (!previous) await rm(publicRoot, { recursive: true, force: true });
  await mkdir(publicRoot, { recursive: true });
  const syncAssets =
    !previous ||
    changedPaths.some(
      (file) => file === "public" || file.startsWith("public/") || file.startsWith("docs.config."),
    );
  let publicFiles = previous?.publicFiles ?? [];
  const publicSource = path.join(root, "public");
  if (await exists(publicSource)) {
    await localPath(root, "public", { directory: true });
    for (const reserved of ["_lenso", "_next", marker, "_redirects"])
      if (await exists(path.join(publicSource, reserved)))
        throw new Error(`public/${reserved} is reserved by lenso-docs.`);
    await validatePublic(publicSource);
    const urls = [
      ...host.pages.map((page) => page.url),
      ...host.routes.map((route) => route.path),
      ...host.redirects.map((redirect) => redirect.from),
    ];
    for (const url of urls) {
      const relative = routePath(url, config.basePath).slice(1);
      for (const output of [
        relative ? `${relative}/index.html` : "index.html",
        ...(relative ? [`${relative}.html`] : []),
      ]) {
        if (await exists(path.join(publicSource, output)))
          throw new Error(`public/${output} conflicts with documentation route "${url}".`);
      }
      if (relative) {
        const info = await exists(path.join(publicSource, relative));
        if (info && !info.isDirectory())
          throw new Error(`public/${relative} conflicts with a documentation route.`);
      }
    }
    for (const file of ["404.html", "sitemap.xml", "robots.txt"])
      if ((file === "404.html" || config.siteUrl) && (await exists(path.join(publicSource, file))))
        throw new Error(`public/${file} is generated by lenso-docs.`);
    if (syncAssets) {
      // Asset edits can turn a file into a directory or vice versa. Rebuild only
      // their mirror; ordinary content edits retain all asset modification times.
      await removeAssetMirror(publicRoot, previous?.publicFiles ?? []);
      publicFiles = await generatedFiles(publicSource);
      for (const relative of publicFiles)
        await writeChanged(
          path.join(publicRoot, relative),
          await readFile(path.join(publicSource, relative)),
        );
    }
  }
  if (await exists(publicSource)) watchPaths.add("public");
  if (syncAssets && !(await exists(publicSource))) {
    await removeAssetMirror(publicRoot, publicFiles);
    publicFiles = [];
  }
  const assets = path.join(publicRoot, "_lenso");
  await mkdir(path.join(assets, "markdown"), { recursive: true });
  await mkdir(path.join(assets, "search"), { recursive: true });
  for (const page of host.pages) {
    const markdown = path.join(assets, "markdown", `${page.id}.md`);
    await mkdir(path.dirname(markdown), { recursive: true });
    if (previous?.pages.find((old) => old.id === page.id)?.markdown !== page.markdown)
      await writeChanged(markdown, page.markdown);
  }
  for (const old of previous?.pages ?? [])
    if (!host.pages.some((page) => page.id === old.id))
      await rm(path.join(assets, "markdown", `${old.id}.md`), { force: true });
  for (const locale of host.locales) {
    let text;
    const localePages = host.pages.filter((page) => page.locale === locale.code);
    const oldPages = previous?.pages.filter((page) => page.locale === locale.code);
    const samePages =
      oldPages?.length === localePages.length &&
      localePages.every(
        (page, index) =>
          oldPages[index].markdown === page.markdown &&
          oldPages[index].url === page.url &&
          oldPages[index].title === page.title &&
          oldPages[index].description === page.description &&
          JSON.stringify(oldPages[index].structuredData) === JSON.stringify(page.structuredData),
      );
    if (
      !host.searchFiles[locale.code] &&
      samePages &&
      previous.host.defaultLocale === host.defaultLocale
    )
      continue;
    if (host.searchFiles[locale.code]) {
      text = await readFile(host.searchFiles[locale.code], "utf8");
      const exported = JSON.parse(text);
      if (exported?.type !== "advanced")
        throw new Error(`Search export for "${locale.code}" must use the advanced static format.`);
    } else {
      // The advanced static DB is the supported Fumadocs 16.9 client format.
      const search = createSearchAPI("advanced", {
        indexes: host.pages
          .filter((page) => page.locale === locale.code)
          .map((page) => ({
            id: page.url.slice(config.basePath.length) || "/",
            title: page.title,
            description: page.description,
            structuredData: page.structuredData,
            url: page.url.slice(config.basePath.length) || "/",
          })),
      });
      const response = await search.staticGET();
      text = await response.text();
    }
    await writeChanged(path.join(assets, "search", `${locale.code}.json`), text);
    if (locale.code === host.defaultLocale)
      await writeChanged(path.join(assets, "search.json"), text);
  }
  for (const locale of previous?.host.locales ?? [])
    if (!host.locales.some((current) => current.code === locale.code))
      await rm(path.join(assets, "search", `${locale.code}.json`), { force: true });
  await mkdir(publicRoot, { recursive: true });
  if (host.redirects.length)
    await writeChanged(
      path.join(publicRoot, "_redirects"),
      host.redirects
        .map((redirect) => `${redirect.from} ${redirect.to} ${redirect.permanent ? 301 : 302}`)
        .join("\n") + "\n",
    );
  else await rm(path.join(publicRoot, "_redirects"), { force: true });
  if (config.siteUrl) {
    const escapeXml = (value) =>
      value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
    const urls = [...host.pages.map((page) => page.url), ...host.routes.map((route) => route.path)];
    await writeChanged(
      path.join(publicRoot, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
        .map((url) => `<url><loc>${escapeXml(new URL(url, config.siteUrl).href)}</loc></url>`)
        .join("")}</urlset>`,
    );
    await writeChanged(
      path.join(publicRoot, "robots.txt"),
      `User-agent: *\nAllow: /\nSitemap: ${new URL(`${config.basePath}/sitemap.xml`, config.siteUrl).href}\n`,
    );
  } else
    for (const file of ["sitemap.xml", "robots.txt"])
      if (!publicFiles.includes(file)) await rm(path.join(publicRoot, file), { force: true });
  // Markdown and public assets must be complete before route modules invalidate Next.
  for (const [file, content] of modules) await writeChanged(file, content);
  // Prune removed exact routes, while retaining unchanged modules for Next HMR.
  for (const folder of ["app", "pages"]) {
    const target = path.join(directory, folder);
    if (await exists(target)) {
      for (const relative of await generatedFiles(target)) {
        if (!emitted.has(path.join(folder, relative))) await rm(path.join(target, relative));
      }
    }
  }
  const buildInputs = [];
  for (const relative of [
    config.build,
    !(development && turbopack) && "babel.config.json",
    "postcss.config.cjs",
  ].filter(Boolean)) {
    const file = path.join(root, relative);
    if (await exists(file)) buildInputs.push([relative, await readFile(file, "utf8")]);
  }
  return {
    config,
    host,
    publicFiles,
    directory,
    configurationKey: scriptJson([config, buildInputs, development && turbopack]),
    pages: host.pages,
    routes: host.routes,
    redirects: host.redirects,
    watchPaths: [...watchPaths],
    generatedPaths: host.generatedPaths,
    prepareBackground: host.prepareBackground,
    sourceWatchKey:
      development && host.watchSource
        ? scriptJson([config, await readFile(path.join(root, config.source), "utf8")])
        : undefined,
  };
}

function nextProcess(command, directory, options) {
  const args = [
    require.resolve("next/dist/bin/next"),
    command,
    directory,
    command === "dev" && options.turbopack ? "--turbopack" : "--webpack",
  ];
  if (command === "dev")
    args.push("--port", String(options.port ?? 3000), "--hostname", options.host ?? "127.0.0.1");
  return spawn(process.execPath, args, {
    cwd: directory,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
}

async function waitForChild(child) {
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(`Next.js exited ${signal ? `with signal ${signal}` : `with code ${code}`}.`),
          );
      });
    });
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  }
}

// Internal dev seam: the callback owns generation; this owns only observation.
export async function watchInputs(
  root,
  watchPaths,
  regenerate,
  onError = console.error,
  generatedPaths = [],
) {
  root = await realpath(root);
  let paths;
  let ignored = generatedPaths;
  let baseline;
  let timer;
  let busy = false;
  let pending = false;
  let closed = false;
  const watchers = [];
  const contained = (relative) =>
    typeof relative === "string" &&
    relative.length > 0 &&
    !path.isAbsolute(relative) &&
    !/[\\:]/u.test(relative) &&
    [...relative].every((character) => character.charCodeAt(0) >= 32) &&
    relative.split("/").every((part) => part && part !== "." && part !== "..") &&
    ![".lenso", "out", "node_modules", ".git"].includes(relative.split("/")[0]);
  const generated = (relative) =>
    ignored.some((input) => relative === input || relative.startsWith(`${input}/`));
  const setPaths = (inputs) => {
    paths = [...new Set(["docs.config.ts", "docs.config.mjs", "public", ...inputs])];
    if (![...paths, ...ignored].every(contained))
      throw new Error("Expected contained watch paths.");
    paths = paths.filter((relative) => !generated(relative));
  };
  const inspect = async (relative) => {
    let file = root;
    let info;
    const parts = relative.split("/");
    for (const [index, part] of parts.entries()) {
      file = path.join(file, part);
      info = await exists(file);
      if (!info) return;
      if (info.isSymbolicLink()) return;
      if (index < parts.length - 1 && !info.isDirectory()) return;
    }
    return info;
  };
  const snapshot = async () => {
    const hash = createHash("sha256");
    const files = new Map();
    const visit = async (relative) => {
      if (generated(relative)) return;
      const info = await inspect(relative);
      const kind = info?.isDirectory() ? "directory" : info?.isFile() ? "file" : "missing";
      files.set(relative, kind);
      hash.update(JSON.stringify([relative, kind]));
      if (info?.isDirectory()) {
        try {
          for (const name of (await readdir(path.join(root, relative))).sort())
            await visit(`${relative}/${name}`);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          hash.update("missing");
        }
      } else if (info?.isFile()) {
        try {
          const content = createHash("sha256")
            .update(await readFile(path.join(root, relative)))
            .digest("hex");
          hash.update(content);
          files.set(relative, content);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          hash.update("missing");
        }
      } else hash.update("missing");
    };
    for (const relative of [...paths].sort()) await visit(relative);
    return { digest: hash.digest("hex"), files };
  };
  const changes = (before, after) =>
    [...new Set([...before.files.keys(), ...after.files.keys()])].filter(
      (file) => before.files.get(file) !== after.files.get(file),
    );
  const closeWatchers = () => {
    for (const watcher of watchers.splice(0)) watcher.close();
  };
  const install = async () => {
    closeWatchers();
    const directories = new Map([["", false]]);
    for (const relative of paths) {
      const parts = relative.split("/");
      for (let index = 1; index <= parts.length; index++) {
        const parent = parts.slice(0, index).join("/");
        const info = await inspect(parent);
        if (!info?.isDirectory()) break;
        directories.set(parent, directories.get(parent) || index === parts.length);
      }
    }
    for (const [relative, recursive] of directories) {
      if (closed) return;
      try {
        const watcher = watch(path.join(root, relative), { recursive }, (_event, name) => {
          const changed = name === null ? relative : path.posix.join(relative, String(name));
          if (
            !generated(changed) &&
            (name === null ||
              paths.some(
                (input) =>
                  changed === input ||
                  changed.startsWith(`${input}/`) ||
                  input.startsWith(`${changed}/`),
              ))
          )
            schedule();
        });
        watcher.on("error", onError);
        watchers.push(watcher);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  };
  const schedule = () => {
    if (closed) return;
    if (busy) {
      pending = true;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(async () => {
      busy = true;
      pending = false;
      try {
        const before = await snapshot();
        if (closed || before.digest === baseline.digest) return;
        const generate = async (changedPaths) => {
          try {
            const inputs = await regenerate(changedPaths);
            if (Array.isArray(inputs)) setPaths(inputs);
            else if (inputs) {
              ignored = inputs.generatedPaths ?? [];
              setPaths(inputs.watchPaths);
            }
          } catch (error) {
            onError(error);
          }
        };
        await generate(changes(baseline, before));
        const after = await snapshot();
        // A concurrent edit needs one catch-up pass. Byte-identical prepare
        // rewrites do not; a producer changing its outputs cannot warm-loop.
        if (!closed && after.digest !== before.digest) await generate(changes(before, after));
        baseline = await snapshot();
      } catch (error) {
        onError(error);
      } finally {
        let changed = false;
        if (!closed) {
          try {
            await install();
            // Subscription replacement has an observation gap. Compare after
            // subscribing so a write in that gap cannot disappear.
            changed = (await snapshot()).digest !== baseline.digest;
          } catch (error) {
            onError(error);
          }
        }
        busy = false;
        if (changed || pending) schedule();
      }
    }, 150);
  };
  setPaths(watchPaths);
  await install();
  baseline = await snapshot();
  const close = () => {
    closed = true;
    clearTimeout(timer);
    closeWatchers();
  };
  close.update = async (inputs, outputs = ignored) => {
    ignored = outputs;
    setPaths(inputs);
    await install();
    const after = await snapshot();
    if (after.digest !== baseline.digest) schedule();
    else baseline = after;
  };
  return close;
}

// Subscription lifecycle only; the dev runtime's existing refresh queue owns work.
export function sourceWatchLifecycle(onChange, onError) {
  let key;
  let dispose;
  let closed = false;
  let generation = 0;
  let pending = Promise.resolve();
  const enqueue = (task) => {
    const result = pending.then(task);
    pending = result.catch(() => {});
    return result;
  };
  const remove = async () => {
    const cleanup = dispose;
    dispose = undefined;
    key = undefined;
    await cleanup?.();
  };
  return {
    update(nextKey, subscribe) {
      return enqueue(async () => {
        if (closed || key === nextKey) return;
        const revision = ++generation;
        await remove();
        if (closed || !subscribe) return;
        const cleanup = await subscribe({
          onChange: (paths) => (!closed && revision === generation ? onChange(paths) : undefined),
          onError,
        });
        if (typeof cleanup !== "function") throw new Error("watchSource must return a disposer.");
        dispose = cleanup;
        key = nextKey;
        if (closed) await remove();
      });
    },
    close() {
      closed = true;
      generation++;
      return enqueue(remove);
    },
  };
}

export async function run(command, root, options = {}) {
  if (options.turbopack && command !== "dev")
    throw new Error("Turbopack is only available for development.");
  if (command === "preview") {
    let config;
    try {
      const metadata = JSON.parse(
        await readFile(path.join(root, "out", "_lenso", "build.json"), "utf8"),
      );
      config = defineDocs(metadata?.config);
    } catch (error) {
      throw new Error(
        "The documentation export is missing or invalid. Run lenso-docs build before preview.",
        { cause: error },
      );
    }
    const server = await serve(path.join(root, "out"), { ...options, basePath: config.basePath });
    console.log(
      `Documentation preview: http://${options.host ?? "127.0.0.1"}:${server.address().port}${config.basePath}/`,
    );
    return;
  }
  let prepared = await prepare(root, {
    development: command === "dev",
    command,
    turbopack: options.turbopack,
  });
  if (command === "build") {
    const output = path.join(root, "out");
    await ownedDirectory(output);
    await waitForChild(nextProcess("build", prepared.directory, options));
    const staging = path.join(prepared.directory, "export-next");
    const backup = path.join(prepared.directory, "export-previous");
    await rm(staging, { recursive: true, force: true });
    await cp(path.join(prepared.directory, "out"), staging, { recursive: true });
    await writeFile(path.join(staging, marker), "lenso-docs\n");
    await writeFile(
      path.join(staging, "_lenso", "build.json"),
      scriptJson({
        config: prepared.config,
        buildId: (
          await readFile(path.join(prepared.directory, ".next", "BUILD_ID"), "utf8")
        ).trim(),
      }),
    );
    await ownedDirectory(output);
    await rm(backup, { recursive: true, force: true });
    await rename(output, backup);
    try {
      await rename(staging, output);
    } catch (error) {
      await rename(backup, output);
      throw error;
    }
    await rm(backup, { recursive: true, force: true });
    console.log(`Built ${prepared.pages.length} documentation pages → ${output}`);
    return;
  }
  let child;
  let stopping = false;
  let restarting = false;
  let closeWatchers = () => {};
  let closeSourceWatch = () => Promise.resolve();
  const onError = (error) => console.error(`lenso-docs: ${error.message}`);
  let resolveDone;
  let rejectDone;
  const done = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  const launch = () => {
    const current = nextProcess("dev", prepared.directory, options);
    current.once("error", (error) => {
      stopping = true;
      closeWatchers();
      closeSourceWatch().catch(onError);
      rejectDone(error);
    });
    current.once("exit", (code, signal) => {
      if (current !== child || restarting) return;
      const expected = stopping || code === 0;
      stopping = true;
      closeWatchers();
      closeSourceWatch().catch(onError);
      if (expected) resolveDone();
      else rejectDone(new Error(`Development server exited ${signal ?? code}.`));
    });
    return current;
  };
  let refreshes = Promise.resolve();
  const refresh = (changedPaths) => {
    const task = refreshes.then(async () => {
      if (stopping) return;
      const next = await prepare(root, {
        development: true,
        turbopack: options.turbopack,
        command: "dev",
        previous: prepared,
        changedPaths,
        background: false,
      });
      if (stopping) return;
      if (next.configurationKey !== prepared.configurationKey) {
        restarting = true;
        const exited = new Promise((resolve) => child.once("exit", resolve));
        child.kill("SIGTERM");
        await exited;
        if (stopping) {
          resolveDone();
          return;
        }
        prepared = next;
        child = launch();
        restarting = false;
      }
      prepared = next;
      await sourceWatcher.update(prepared.sourceWatchKey, prepared.host.watchSource);
      return { watchPaths: prepared.watchPaths, generatedPaths: prepared.generatedPaths };
    });
    refreshes = task.catch(() => {});
    return task;
  };
  const sourceWatcher = sourceWatchLifecycle(async (paths) => {
    await refresh(paths);
    if (!stopping) await closeWatchers.update(prepared.watchPaths, prepared.generatedPaths);
  }, onError);
  closeSourceWatch = () => sourceWatcher.close();
  closeWatchers = await watchInputs(
    root,
    prepared.watchPaths,
    refresh,
    onError,
    prepared.generatedPaths,
  );
  try {
    await sourceWatcher.update(prepared.sourceWatchKey, prepared.host.watchSource);
  } catch (error) {
    closeWatchers();
    await closeSourceWatch();
    throw error;
  }
  const stop = () => {
    stopping = true;
    closeWatchers();
    closeSourceWatch().catch(onError);
    child?.kill("SIGTERM");
  };
  child = launch();
  if (prepared.prepareBackground) {
    const background = prepared.prepareBackground;
    const preparation = refreshes.then(() => background());
    refreshes = preparation.catch(() => {});
    preparation
      .then(async () => {
        if (stopping) return;
        await refresh(["docs.source.mjs"]);
        if (!stopping) await closeWatchers.update(prepared.watchPaths, prepared.generatedPaths);
      })
      .catch((error) =>
        console.error(
          `lenso-docs: Background preparation failed: ${error.message}. Retry with the application generate command.`,
        ),
      );
  }
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    await done;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    closeWatchers();
    await closeSourceWatch();
  }
}
