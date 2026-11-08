import fs from "node:fs";
import { createHash } from "node:crypto";
import { readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { existingPath as exists } from "./filesystem.ts";
import type { SourceWatchCallbacks } from "./host.ts";

type WatchPlan = string[] | { watchPaths: string[]; generatedPaths?: string[] } | void;
type Disposer = () => void | Promise<void>;
type Subscribe = (callbacks: SourceWatchCallbacks) => Disposer | Promise<Disposer>;
interface Snapshot {
  digest: string;
  files: Map<string, string>;
}

// Internal dev seam: the callback owns generation; this owns only observation.
export async function watchInputs(
  root: string,
  watchPaths: string[],
  regenerate: (changedPaths: string[]) => WatchPlan | Promise<WatchPlan>,
  onError: (error: unknown) => void = console.error,
  generatedPaths: string[] = [],
) {
  root = await realpath(root);
  let paths: string[] = [];
  let ignored = generatedPaths;
  let baseline!: Snapshot;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;
  let pending = false;
  let closed = false;
  const watchers: fs.FSWatcher[] = [];
  const contained = (relative: string): boolean =>
    typeof relative === "string" &&
    relative.length > 0 &&
    !path.isAbsolute(relative) &&
    !/[\\:]/u.test(relative) &&
    [...relative].every((character) => character.charCodeAt(0) >= 32) &&
    relative.split("/").every((part) => part && part !== "." && part !== "..") &&
    ![".lenso", "out", "node_modules", ".git"].includes(relative.split("/")[0]!);
  const generated = (relative: string): boolean =>
    ignored.some((input) => relative === input || relative.startsWith(`${input}/`));
  const setPaths = (inputs: string[]): void => {
    paths = [...new Set(["docs.config.ts", "docs.config.mjs", "public", ...inputs])];
    if (![...paths, ...ignored].every(contained))
      throw new Error("Expected contained watch paths.");
    paths = paths.filter((relative) => !generated(relative));
  };
  const inspect = async (relative: string): Promise<fs.Stats | undefined> => {
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
  const snapshot = async (): Promise<Snapshot> => {
    const hash = createHash("sha256");
    const files = new Map<string, string>();
    const visit = async (relative: string): Promise<void> => {
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
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
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
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
          hash.update("missing");
        }
      } else hash.update("missing");
    };
    for (const relative of [...paths].sort()) await visit(relative);
    return { digest: hash.digest("hex"), files };
  };
  const changes = (before: Snapshot, after: Snapshot): string[] =>
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
        const watcher = fs.watch(path.join(root, relative), { recursive }, (_event, name) => {
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
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  };
  const schedule = (): void => {
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
        const generate = async (changedPaths: string[]): Promise<void> => {
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
        if (!closed && after.digest !== before.digest) {
          await generate(changes(before, after));
          baseline = await snapshot();
        } else baseline = after;
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
  close.update = async (inputs: string[], outputs: string[] = ignored): Promise<void> => {
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
export function sourceWatchLifecycle(
  onChange: (paths: string[]) => void | Promise<unknown>,
  onError: (error: unknown) => void,
) {
  let key: string | undefined;
  let dispose: Disposer | undefined;
  let closed = false;
  let generation = 0;
  let pending = Promise.resolve();
  const enqueue = (task: () => Promise<void>): Promise<void> => {
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
    update(nextKey: string | undefined, subscribe?: Subscribe) {
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
