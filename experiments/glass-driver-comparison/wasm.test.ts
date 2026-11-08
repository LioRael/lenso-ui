import { test, expect } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { binary, sourceHash } from "./generated/binary";
import init from "./generated/runtime.js";

// A stale optional binary must not invalidate same-shader comparisons.
test("comparison Wasm instantiates within its size budget and matches the retained source", async () => {
  const digest = createHash("sha256");
  for (const file of [
    "Cargo.toml",
    "Cargo.lock",
    "src/lib.rs",
    "src/web.rs",
    "../../../packages/glass/shaders/ios27.frag",
    "../../../packages/glass/shaders/quad.vert",
    "../../../packages/glass/shaders/blur.frag",
  ])
    digest.update(await readFile(new URL(`./renderer/${file}`, import.meta.url)));
  expect(digest.digest("hex")).toBe(sourceHash);
  const bytes = Uint8Array.from(atob(binary), (c) => c.charCodeAt(0));
  expect(bytes.length).toBeLessThanOrEqual(48 * 1024);
  expect(gzipSync(bytes).length).toBeLessThanOrEqual(20 * 1024);
  const module = await init({
    module_or_path: bytes,
  });
  expect(typeof module.glassrenderer_new).toBe("function");
});
