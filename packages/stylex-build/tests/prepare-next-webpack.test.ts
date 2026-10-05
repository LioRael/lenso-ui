import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import test from "node:test";
import { prepareNext } from "@lenso/stylex-build";

interface Stats {
  hasErrors(): boolean;
  toString(): string;
}
type Callback = (error: Error | null, stats?: Stats) => void;
interface Watching {
  close(callback: (error?: Error) => void): void;
}
interface Compiler {
  run(callback: Callback): void;
  watch(options: object, callback: Callback): Watching;
  close(callback: (error?: Error) => void): void;
}
interface Config {
  context: string;
  mode: "production";
  entry: string;
  output: { path: string };
  cache: false | { type: "filesystem"; cacheDirectory: string };
  optimization: { minimize: false };
  plugins: Awaited<ReturnType<typeof prepareNext>>[];
}
// Use the installed Next distribution's Webpack binary only as a test runner.
// The production adapter uses public compiler hooks, not this module path.
const project = resolve(import.meta.dirname, "../../..");
const require = createRequire(join(project, "apps/docs/package.json"));
const { webpack } = require("next/dist/compiled/webpack/webpack") as {
  webpack(config: Config): Compiler;
};
const output = join(project, "test-results/stylex-webpack");
async function close(compiler: Compiler) {
  await new Promise<void>((done, reject) =>
    compiler.close((error) => (error ? reject(error) : done())),
  );
}
async function run(compiler: Compiler) {
  try {
    return await new Promise<Stats>((done, reject) => {
      compiler.run((error, stats) => {
        if (error) return reject(error);
        assert(stats);
        done(stats);
      });
    });
  } finally {
    await close(compiler);
  }
}
async function fixture() {
  await mkdir(output, { recursive: true });
  const root = await mkdtemp(join(output, "prepared-"));
  await writeFile(join(root, "package.json"), "{}");
  await symlink(join(project, "apps/docs/node_modules"), join(root, "node_modules"));
  const source = join(root, "foo.js");
  await writeFile(
    source,
    "import * as stylex from '@stylexjs/stylex';export const styles=stylex.create({root:{color:'blue'}});",
  );
  await writeFile(join(root, "entry.js"), "import {styles} from './foo.js';console.log(styles);");
  const cssFile = join(root, "stylex.css");
  const prepare = (sources: string[]) => prepareNext({ sourceOnly: true, sources, cssFile });
  const config = (plugin: Config["plugins"][number]): Config => ({
    context: root,
    mode: "production",
    entry: "./entry.js",
    output: { path: join(root, "dist") },
    cache: false,
    optimization: { minimize: false },
    plugins: [plugin],
  });
  return { root, source, cssFile, prepare, config };
}

// Reusing cached source transforms previously let a changed sources list emit
// marker-only CSS while the unchanged imported module silently skipped validation.
test("real Webpack refuses transform caches; an uncached omitted source fails after a covered build", async () => {
  const { root, source, cssFile, prepare, config } = await fixture();
  try {
    const covered = await prepare([source]);
    assert.throws(
      () =>
        webpack({
          ...config(covered),
          cache: { type: "filesystem", cacheDirectory: join(root, "cache") },
        }),
      /requires config\.cache = false/,
    );
    const first = await run(webpack(config(covered)));
    assert.equal(first.hasErrors(), false, first.toString());
    assert.match(await readFile(cssFile, "utf8"), /color:\s*(?:blue|#00f)/);
    const omitted = await prepare([]);
    const second = await run(webpack(config(omitted)));
    assert(second.hasErrors(), "An unchanged imported source must not bypass the new coverage set");
    assert.match(second.toString(), /Unprepared StyleX rules.*foo\.js/s);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("real compiler.watch is rejected even when compiler options do not enable watch", async () => {
  const { root, source, prepare, config } = await fixture();
  const compiler = webpack(config(await prepare([source])));
  let watching: Watching | undefined;
  try {
    const error = await new Promise<Error>((done, reject) => {
      watching = compiler.watch({}, (error, stats) => {
        if (!error) return reject(new Error(`Watch unexpectedly ran: ${stats?.toString()}`));
        done(error);
      });
    });
    assert.match(error.message, /production builds only/);
  } finally {
    if (watching)
      await new Promise<void>((done, reject) =>
        watching?.close((error) => (error ? reject(error) : done())),
      );
    await close(compiler);
    await rm(root, { recursive: true, force: true });
  }
});
