import assert from "node:assert/strict";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer, type AddressInfo } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "bun:test";

const run = promisify(execFile);
const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = (server.address() as AddressInfo).port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function stop(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  child.kill("SIGTERM");
  await exited;
}

// Workspace resolution and source snapshots cannot prove that a packed initializer
// creates a working standalone install, nor that dev and export remain isolated.
test("packed Docs creates and serves a standalone Vite site outside the workspace", async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), "lenso-docs-consumer-")));
  const children: ChildProcess[] = [];
  let log = "";
  try {
    const packages = ["tokens", "glass", "primitives", "ui", "docs", "create-docs"];
    for (const name of packages)
      await run("bun", ["pm", "pack", "--destination", directory, "--ignore-scripts"], {
        cwd: join(workspace, "packages", name),
      });
    const tarballs = (await readdir(directory)).filter((file) => file.endsWith(".tgz"));
    const overrides = Object.fromEntries(
      packages.map((name) => {
        const prefix = name === "create-docs" ? "create-lenso-docs-" : `lenso-${name}-`;
        const tarball = tarballs.find((file) => file.startsWith(prefix));
        assert.ok(tarball, `Missing ${name} package`);
        return [
          name === "create-docs" ? "create-lenso-docs" : `@lenso/${name}`,
          `file:${join(directory, tarball)}`,
        ];
      }),
    );
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: { "create-lenso-docs": overrides["create-lenso-docs"] },
      }),
    );
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], { cwd: directory });
    await run(
      "bun",
      ["node_modules/create-lenso-docs/src/cli.ts", "site", "--packages", directory],
      { cwd: directory },
    );
    const project = join(directory, "site");
    const customization = join(project, "docs-components.tsx");
    await writeFile(
      customization,
      (await readFile(customization, "utf8")) +
        '\nexport function getRootOptions() { return { metadata: { applicationName: "Packed Docs" } }; }\n',
    );
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], { cwd: project });
    const installed = await realpath(join(project, "node_modules/@lenso/docs"));
    assert.ok(installed.startsWith(directory));
    const createServer = (args: string[]) => {
      const child = spawn("bun", args, { cwd: project, stdio: ["ignore", "pipe", "pipe"] });
      children.push(child);
      child.stdout!.on("data", (chunk) => {
        log += String(chunk);
      });
      child.stderr!.on("data", (chunk) => {
        log += String(chunk);
      });
      return child;
    };
    const devPort = await freePort();
    const dev = createServer(["run", "dev", "--port", String(devPort)]);
    const waitFor = async (url: string, contains: string) => {
      const deadline = Date.now() + 30000;
      while (Date.now() < deadline) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          if (response.ok && html.includes(contains)) return html;
        } catch {
          /* The server may still be starting. */
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(`Timed out waiting for ${url} to contain ${contains}.\n${log}`);
    };
    const devUrl = `http://127.0.0.1:${devPort}`;
    const html = await waitFor(devUrl, "Welcome");
    assert.match(html, /virtual:stylex\.css/);
    assert.match(html, /--shiki-light/);
    await run("bun", ["check", "--no-script", "-p", ".lenso/dev/tsconfig.json"], { cwd: project });
    await mkdir(join(project, "content", "nested"));
    await writeFile(
      join(project, "content", "nested", "new.md"),
      "# Newly added guide\n\nHMR body marker.\n",
    );
    await waitFor(`${devUrl}/nested/new/`, "HMR body marker.");
    const source = join(project, "content", "index.mdx");
    await writeFile(source, (await readFile(source, "utf8")) + "\nUpdated Markdown marker.\n");
    await waitFor(devUrl, "Updated Markdown marker.");
    const component = join(project, "components", "Counter.tsx");
    await writeFile(
      component,
      (await readFile(component, "utf8")).replace("Count:", "Updated count:"),
    );
    await waitFor(`${devUrl}/components/counter/`, "Updated count:");
    const build = await run("bun", ["run", "build"], { cwd: project, maxBuffer: 4 * 1024 * 1024 });
    log += build.stdout + build.stderr;
    assert.equal(dev.exitCode, null);
    await waitFor(devUrl, "Updated Markdown marker.");
    const output = join(project, "out");
    const exported = await readFile(join(output, "index.html"), "utf8");
    assert.match(exported, /Updated Markdown marker/);
    assert.match(exported, /name="application-name" content="Packed Docs"/);
    assert.ok(
      !exported.includes('<div hidden id="S:'),
      "The article must not require a Suspense reveal script",
    );
    assert.doesNotMatch(exported, /virtual:stylex|\/@vite\//);
    assert.match(
      await readFile(join(output, "components/counter/index.html"), "utf8"),
      /Updated count:/,
    );
    assert.equal(
      await readFile(join(output, "_lenso/markdown/index.md"), "utf8"),
      await readFile(source, "utf8"),
    );
    assert.match(await readFile(join(output, "404.html"), "utf8"), /Page not found/);
    const assets = await readdir(join(output, "assets"));
    const styles = await Promise.all(
      assets
        .filter((file) => file.endsWith(".css"))
        .map((file) => readFile(join(output, "assets", file), "utf8")),
    );
    assert.ok(styles.some((css) => css.includes(".x") && css.includes("--lenso-label-primary")));
    assert.ok(assets.some((file) => file.endsWith(".ttf")));
    const previewPort = await freePort();
    const previewUrl = `http://127.0.0.1:${previewPort}`;
    const preview = createServer(["run", "preview", "--port", String(previewPort)]);
    await waitFor(`${previewUrl}/nested/new/`, "HMR body marker.");
    const missing = await fetch(`${previewUrl}/missing-page`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Page not found/);
    await stop(preview);
    await stop(dev);
    // A deployment prefix must affect assets and links, not introduce another output directory.
    const config = join(project, "docs.config.ts");
    await writeFile(
      config,
      (await readFile(config, "utf8")).replace(
        'title: "Field Notes",',
        'title: "Field Notes", basePath: "/manual",',
      ),
    );
    await run("bun", ["run", "build"], { cwd: project, maxBuffer: 4 * 1024 * 1024 });
    const prefixed = await readFile(join(output, "index.html"), "utf8");
    assert.match(prefixed, /\/manual\/assets\//);
    assert.match(prefixed, /href="\/manual\/guides\//);
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.stack : error}\n${log}`);
  } finally {
    for (const child of children.reverse()) await stop(child);
    await rm(directory, { recursive: true, force: true });
  }
}, 180000);
