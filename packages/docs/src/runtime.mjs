import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
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
    if ((await readFile(file, "utf8")) === content) return;
  }
  await writeFile(file, content);
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

export async function prepare(
  root,
  { development = false, command = development ? "dev" : "build" } = {},
) {
  root = path.resolve(root);
  const config = await loadConfig(root);
  const host = await loadHost(root, config, command);
  const directory = path.join(root, ".lenso");
  await ownedDirectory(directory);
  await linkPackages(directory);
  await writeChanged(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "lenso-docs-runtime", private: true, type: "module" }),
  );
  const emitted = new Set();
  await generateHost(root, directory, config, host, {
    development,
    source,
    write: async (file, content) => {
      emitted.add(path.relative(directory, file));
      await writeChanged(file, content);
    },
  });
  // Prune removed exact routes, while retaining unchanged modules for Next HMR.
  for (const folder of ["app", "pages"]) {
    const target = path.join(directory, folder);
    if (await exists(target)) {
      for (const relative of await generatedFiles(target)) {
        if (!emitted.has(path.join(folder, relative))) await rm(path.join(target, relative));
      }
    }
  }
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
    if (await exists(original)) {
      await localPath(root, name);
      watchPaths.add(name);
      await writeChanged(
        staged,
        name === "postcss.config.cjs"
          ? `module.exports = require(${scriptJson(original)});\n`
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
    await validatePublic(publicRoot);
  }
  await rm(publicRoot, { recursive: true, force: true });
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
    await cp(publicSource, publicRoot, { recursive: true, dereference: false });
    watchPaths.add("public");
  }
  const assets = path.join(publicRoot, "_lenso");
  await mkdir(path.join(assets, "markdown"), { recursive: true });
  await mkdir(path.join(assets, "search"), { recursive: true });
  for (const page of host.pages) {
    const markdown = path.join(assets, "markdown", `${page.id}.md`);
    await mkdir(path.dirname(markdown), { recursive: true });
    await writeFile(markdown, page.markdown);
  }
  for (const locale of host.locales) {
    let text;
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
    await writeFile(path.join(assets, "search", `${locale.code}.json`), text);
    if (locale.code === host.defaultLocale) await writeFile(path.join(assets, "search.json"), text);
  }
  await mkdir(publicRoot, { recursive: true });
  if (host.redirects.length)
    await writeFile(
      path.join(publicRoot, "_redirects"),
      host.redirects
        .map((redirect) => `${redirect.from} ${redirect.to} ${redirect.permanent ? 301 : 302}`)
        .join("\n") + "\n",
    );
  if (config.siteUrl) {
    const escapeXml = (value) =>
      value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
    const urls = [...host.pages.map((page) => page.url), ...host.routes.map((route) => route.path)];
    await writeFile(
      path.join(publicRoot, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
        .map((url) => `<url><loc>${escapeXml(new URL(url, config.siteUrl).href)}</loc></url>`)
        .join("")}</urlset>`,
    );
    await writeFile(
      path.join(publicRoot, "robots.txt"),
      `User-agent: *\nAllow: /\nSitemap: ${new URL(`${config.basePath}/sitemap.xml`, config.siteUrl).href}\n`,
    );
  }
  const buildInputs = [];
  for (const relative of [config.build, "babel.config.json", "postcss.config.cjs"].filter(
    Boolean,
  )) {
    const file = path.join(root, relative);
    if (await exists(file)) buildInputs.push([relative, await readFile(file, "utf8")]);
  }
  return {
    config,
    directory,
    configurationKey: scriptJson([config, buildInputs]),
    pages: host.pages,
    routes: host.routes,
    redirects: host.redirects,
    watchPaths: [...watchPaths],
  };
}

function nextProcess(command, directory, options) {
  const args = [require.resolve("next/dist/bin/next"), command, directory, "--webpack"];
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
export async function watchInputs(root, watchPaths, regenerate, onError = console.error) {
  root = await realpath(root);
  let paths;
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
  const setPaths = (inputs) => {
    paths = [...new Set(["docs.config.ts", "docs.config.mjs", "public", ...inputs])];
    if (!paths.every(contained)) throw new Error("Expected contained watch paths.");
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
    const visit = async (relative) => {
      const info = await inspect(relative);
      hash.update(JSON.stringify([relative, info?.isDirectory() ? "directory" : "file"]));
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
          hash.update(
            createHash("sha256")
              .update(await readFile(path.join(root, relative)))
              .digest(),
          );
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          hash.update("missing");
        }
      } else hash.update("missing");
    };
    for (const relative of [...paths].sort()) await visit(relative);
    return hash.digest("hex");
  };
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
            name === null ||
            paths.some(
              (input) =>
                changed === input ||
                changed.startsWith(`${input}/`) ||
                input.startsWith(`${changed}/`),
            )
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
        if (closed || before === baseline) return;
        const generate = async () => {
          try {
            const inputs = await regenerate();
            if (inputs) setPaths(inputs);
          } catch (error) {
            onError(error);
          }
        };
        await generate();
        const after = await snapshot();
        // A concurrent edit needs one catch-up pass. Byte-identical prepare
        // rewrites do not; a producer changing its outputs cannot warm-loop.
        if (!closed && after !== before) await generate();
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
            changed = (await snapshot()) !== baseline;
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
  return () => {
    closed = true;
    clearTimeout(timer);
    closeWatchers();
  };
}

export async function run(command, root, options = {}) {
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
  let prepared = await prepare(root, { development: command === "dev", command });
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
      rejectDone(error);
    });
    current.once("exit", (code, signal) => {
      if (current !== child || restarting) return;
      closeWatchers();
      if (stopping || code === 0) resolveDone();
      else rejectDone(new Error(`Development server exited ${signal ?? code}.`));
    });
    return current;
  };
  closeWatchers = await watchInputs(
    root,
    prepared.watchPaths,
    async () => {
      if (stopping) return;
      try {
        const next = await prepare(root, { development: true, command: "dev" });
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
        return prepared.watchPaths;
      } catch (error) {
        restarting = false;
        throw error;
      }
    },
    (error) => console.error(`lenso-docs: ${error.message}`),
  );
  const stop = () => {
    stopping = true;
    closeWatchers();
    child?.kill("SIGTERM");
  };
  child = launch();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    await done;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    closeWatchers();
  }
}
