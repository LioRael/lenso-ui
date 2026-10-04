import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, truncate, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { checkExportSize, MAX_EXPORT_FILE_BYTES } from "./check-export-size.mjs";

// Next's successful export did not prove Cloudflare could accept its raw files.
// Exercise the same filesystem boundary, including nested assets and the exact limit.
test("accepts the hosting boundary and reports the actual largest file", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-export-size-"));
  try {
    await mkdir(path.join(root, "nested"));
    await writeFile(path.join(root, "index.html"), "small");
    await writeFile(path.join(root, "nested/search.json"), "");
    await truncate(path.join(root, "nested/search.json"), MAX_EXPORT_FILE_BYTES);
    const result = await checkExportSize(root);
    assert.equal(result.files, 2);
    assert.deepEqual(result.largest, {
      file: path.join("nested", "search.json"),
      bytes: MAX_EXPORT_FILE_BYTES,
    });
  } finally {
    await rm(root, { recursive: true });
  }
});

test("rejects any oversized export, not just the known Autocomplete HTML", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-export-size-"));
  try {
    await mkdir(path.join(root, "_next"));
    await writeFile(path.join(root, "_next/bundle.js"), "");
    await truncate(path.join(root, "_next/bundle.js"), MAX_EXPORT_FILE_BYTES + 1);
    await assert.rejects(
      checkExportSize(root),
      (error) =>
        error.message.includes(path.join("_next", "bundle.js")) &&
        error.message.includes(String(MAX_EXPORT_FILE_BYTES + 1)),
    );
  } finally {
    await rm(root, { recursive: true });
  }
});

test("does not silently certify symbolic export entries", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-export-size-"));
  try {
    await writeFile(path.join(root, "data.json"), "data");
    await symlink("data.json", path.join(root, "alias.json"));
    await assert.rejects(checkExportSize(root), /Cannot verify symbolic export entry: alias.json/);
  } finally {
    await rm(root, { recursive: true });
  }
});
