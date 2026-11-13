import { spawn, type ChildProcess } from "node:child_process";
import type { AddressInfo } from "node:net";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import {
  cp,
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
import type { StructuredData } from "fumadocs-core/mdx-plugins/remark-structure";
import { defineDocs, loadConfig, type ResolvedDocsConfig } from "./config.ts";
import {
  loadHost,
  localPath,
  routePath,
  type HostPage,
  type HostRedirect,
  type HostRoute,
} from "./host.ts";
import { generateHost } from "./generate-host.ts";
import { serve } from "./serve.ts";
import { existingPath as exists } from "./filesystem.ts";
import { sourceWatchLifecycle, watchInputs } from "./watch.ts";
export { sourceWatchLifecycle, watchInputs } from "./watch.ts";

type LoadedHost = Awaited<ReturnType<typeof loadHost>> & { searchRevision: string };
interface Prepared {
  config: ResolvedDocsConfig;
  host: LoadedHost;
  publicFiles: string[];
  directory: string;
  configurationKey: string;
  pages: readonly HostPage[];
  routes: (HostRoute & { locale: string })[];
  redirects: HostRedirect[];
  watchPaths: string[];
  generatedPaths: string[];
  prepareBackground: (() => void | Promise<void>) | undefined;
  sourceWatchKey: string | undefined;
}
interface RunOptions {
  port?: number;
  host?: string;
}
interface PrepareOptions {
  development?: boolean;
  command?: "dev" | "build";
  previous?: Prepared;
  changedPaths?: string[];
  background?: boolean;
}

const require = createRequire(import.meta.url);
const source = path.dirname(fileURLToPath(import.meta.url));
const marker = ".lenso-owned";
const runtimePackages = [
  "@lenso/docs",
  "vite",
  "@vitejs/plugin-react",
  "@tanstack/react-router",
  "@tanstack/react-start",
  "@stylexjs/unplugin",
  "@stylexjs/stylex",
  "@ui-sdk/core",
  "@ui-sdk/react",
  "@gravity-ui/icons",
  "@fuma-translate/react",
  "culori",
  "react",
  "react-dom",
  "fumadocs-ui",
  "fumadocs-core",
  "typescript",
  "@types/node",
  "@types/react",
  "@types/react-dom",
];

async function ownedDirectory(directory: string): Promise<void> {
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

async function generatedParents(directory: string): Promise<void> {
  if (path.basename(directory) !== ".lenso") await generatedParents(path.dirname(directory));
  const info = await exists(directory);
  if (info) {
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new Error(`Generated directory cannot be a symlink or file: ${directory}`);
    return;
  }
  await mkdir(directory);
}

async function writeChanged(file: string, content: string | Buffer): Promise<void> {
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

async function linkPackages(directory: string): Promise<void> {
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

function scriptJson(value: unknown): string {
  return JSON.stringify(value)!.replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028");
}

async function validatePublic(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Public assets cannot be symlinks: ${file}`);
    if (entry.isDirectory()) await validatePublic(file);
  }
}

async function generatedFiles(directory: string, prefix = ""): Promise<string[]> {
  const files: string[] = [];
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

async function removeAssetMirror(publicRoot: string, files: string[]): Promise<void> {
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
  root: string,
  {
    development = false,
    command = development ? "dev" : "build",
    previous,
    changedPaths = [],
    background = true,
  }: PrepareOptions = {},
): Promise<Prepared> {
  root = path.resolve(root);
  const config = await loadConfig(root);
  const host = (await loadHost(root, config, command, {
    ...(previous ? { previous: previous.host } : {}),
    changedPaths,
    background,
  })) as LoadedHost;
  await ownedDirectory(path.join(root, ".lenso"));
  const directory = path.join(root, ".lenso", development ? "dev" : "build");
  await ownedDirectory(directory);
  await linkPackages(directory);
  await writeChanged(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "lenso-docs-runtime", private: true, type: "module" }),
  );
  const emitted = new Set<string>();
  const modules = new Map<string, string>();
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
    write: async (file, content) => {
      emitted.add(path.relative(directory, file));
      modules.set(file, content);
    },
  });
  const watchPaths = new Set(host.watchPaths);
  for (const relative of ["components", "root", "build"] as const) {
    if (config[relative]) {
      await localPath(root, config[relative]);
      watchPaths.add(config[relative]);
    }
  }
  for (const relative of config.styles ?? []) watchPaths.add(relative);
  const publicRoot = path.join(directory, "public");
  if (await exists(publicRoot)) {
    if ((await fs.promises.lstat(publicRoot)).isSymbolicLink())
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
    for (const reserved of ["_lenso", "_next", "assets", marker, "_redirects"])
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
          oldPages[index]!.markdown === page.markdown &&
          oldPages[index]!.url === page.url &&
          oldPages[index]!.title === page.title &&
          oldPages[index]!.description === page.description &&
          JSON.stringify(oldPages[index]!.structuredData) === JSON.stringify(page.structuredData),
      );
    const searchFile = host.searchFiles[locale.code];
    if (!searchFile && samePages && previous?.host.defaultLocale === host.defaultLocale) continue;
    if (searchFile) {
      text = await readFile(searchFile, "utf8");
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
            ...(page.description !== undefined ? { description: page.description } : {}),
            structuredData: page.structuredData as StructuredData,
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
    const escapeXml = (value: string) =>
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
  // Markdown and public assets must be complete before route modules invalidate Vite.
  for (const [file, content] of modules) await writeChanged(file, content);
  // Retired root modules otherwise coexist with and can shadow the TypeScript config.
  for (const name of [
    "next.config.ts",
    "next.config.mjs",
    "babel.config.json",
    "postcss.config.cjs",
    "model.mjs",
    "render.jsx",
  ]) {
    const file = path.join(directory, name);
    const info = await exists(file);
    if (info) {
      if (!info.isFile() || info.isSymbolicLink())
        throw new Error(`Generated file cannot be a symlink or directory: ${file}`);
      await rm(file);
    }
  }
  // Prune removed exact routes, while retaining unchanged modules for Next HMR.
  for (const folder of ["app", "documents", "pages", "src/routes"]) {
    const target = path.join(directory, folder);
    const info = await exists(target);
    if (info) {
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error(`Generated directory cannot be a symlink or file: ${target}`);
      for (const relative of await generatedFiles(target)) {
        if (!emitted.has(path.join(folder, relative))) await rm(path.join(target, relative));
      }
    }
  }
  const buildInputs: [string, string][] = [];
  for (const relative of [config.build].filter((value): value is string => Boolean(value))) {
    const file = path.join(root, relative);
    if (await exists(file)) buildInputs.push([relative, await readFile(file, "utf8")]);
  }
  return {
    config,
    host,
    publicFiles,
    directory,
    configurationKey: scriptJson([config, buildInputs]),
    pages: host.pages,
    routes: host.routes,
    redirects: host.redirects,
    watchPaths: [...watchPaths],
    generatedPaths: host.generatedPaths,
    prepareBackground: host.prepareBackground,
    sourceWatchKey:
      development && host.watchSource
        ? scriptJson([config, await readFile(path.join(root, config.source!), "utf8")])
        : undefined,
  };
}

function viteProcess(
  command: "dev" | "build",
  directory: string,
  options: RunOptions,
): ChildProcess {
  const viteRoot = path.dirname(require.resolve("vite/package.json"));
  const args = [
    path.join(viteRoot, "bin/vite.js"),
    ...(command === "build" ? ["build"] : []),
    "--configLoader",
    "runner",
  ];
  if (command === "dev")
    args.push("--port", String(options.port ?? 3000), "--host", options.host ?? "127.0.0.1");
  return spawn("node", args, {
    cwd: directory,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: command === "build" ? "production" : "development" },
  });
}

async function waitForChild(child: ChildProcess): Promise<void> {
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  try {
    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(`Vite exited ${signal ? `with signal ${signal}` : `with code ${code}`}.`),
          );
      });
    });
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  }
}

export async function run(
  command: "dev" | "build" | "preview",
  root: string,
  options: RunOptions = {},
): Promise<void> {
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
      `Documentation preview: http://${options.host ?? "127.0.0.1"}:${(server.address() as AddressInfo).port}${config.basePath}/`,
    );
    return;
  }
  let prepared = await prepare(root, {
    development: command === "dev",
    command,
  });
  if (command === "build") {
    const output = path.join(root, "out");
    await ownedDirectory(output);
    await waitForChild(viteProcess("build", prepared.directory, options));
    const staging = path.join(prepared.directory, "export-vite");
    const backup = path.join(prepared.directory, "export-previous");
    await rm(staging, { recursive: true, force: true });
    await cp(path.join(prepared.directory, "out"), staging, { recursive: true });
    await writeFile(path.join(staging, marker), "lenso-docs\n");
    await writeFile(
      path.join(staging, "_lenso", "build.json"),
      scriptJson({
        config: prepared.config,
        buildId: randomUUID(),
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
  let child!: ChildProcess;
  let stopping = false;
  let restarting = false;
  let closeWatchers!: Awaited<ReturnType<typeof watchInputs>>;
  let closeSourceWatch = () => Promise.resolve();
  const onError = (error: unknown) =>
    console.error(`lenso-docs: ${error instanceof Error ? error.message : error}`);
  let resolveDone!: () => void;
  let rejectDone!: (error: Error) => void;
  const done = new Promise<void>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  const launch = () => {
    const current = viteProcess("dev", prepared.directory, options);
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
  let refreshes: Promise<unknown> = Promise.resolve();
  const refresh = (changedPaths: string[]) => {
    const task = refreshes.then(async () => {
      if (stopping) return;
      const next = await prepare(root, {
        development: true,
        command: "dev",
        previous: prepared,
        changedPaths,
        background: false,
      });
      if (stopping) return;
      if (next.configurationKey !== prepared.configurationKey) {
        restarting = true;
        const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
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
        await refresh([prepared.config.source!]);
        if (!stopping) await closeWatchers.update(prepared.watchPaths, prepared.generatedPaths);
      })
      .catch((error) =>
        console.error(
          `lenso-docs: Background preparation failed: ${error instanceof Error ? error.message : error}. Retry with the application generate command.`,
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
