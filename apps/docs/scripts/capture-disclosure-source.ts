import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const revision = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
export const sourcePins: Record<string, string> = {
  "en/disclosure/basic.tsx": "7bc9e387c2cfc9f7df0a0d9e751dbba01a72de22b7f8ebba7987d23bb5b1b54e",
  "en/disclosure/render-function.tsx":
    "6ef00d46d2b622b5821cb746908ca8dac39e44152d36a3b4962fef8f47897972",
  "en/disclosure-group/basic.tsx":
    "89164db9d79e2b849cdaac9495ef26fb058dac14a164030a218b33c683c45098",
  "en/disclosure-group/controlled.tsx":
    "8ad0654b72c71e4c3c28941a19ab93e1690ca71589b6f6520c5b1f6d73f0c0dc",
  "cn/disclosure/basic.tsx": "68a5d7d5deaddb92ff9541639f79f1a6b03536add4851f7a0cc10fca9828e599",
  "cn/disclosure/render-function.tsx":
    "01611713aaa167b296005342635bcd88af1afa944249c8c725e819a6026bc235",
  "cn/disclosure-group/basic.tsx":
    "30858d6ebb60fe3a6e8fed79df6edf0ff7f959fca8a721067bca40256f42327b",
  "cn/disclosure-group/controlled.tsx":
    "84ea74396ed1df40298cd2a270932bcdf226ca61186aecfc6bcb40844536a412",
};
export const sourceUrl = (file: string): string =>
  `https://raw.githubusercontent.com/heroui-inc/heroui/${revision}/apps/docs/src/demos/${file}`;
type Capture = {
  revision: string;
  license: string;
  sources: Record<string, { url: string; sha256: string; code: string }>;
};

export function verifySourceCapture(capture: Capture): Capture {
  if (capture.revision !== revision || capture.license !== "Apache-2.0")
    throw new Error("Unexpected disclosure source capture revision or license");
  if (Object.keys(capture.sources).sort().join() !== Object.keys(sourcePins).sort().join())
    throw new Error("Unexpected disclosure source capture files");
  for (const [file, sha256] of Object.entries(sourcePins)) {
    const entry = capture.sources[file];
    if (
      entry.url !== sourceUrl(file) ||
      entry.sha256 !== sha256 ||
      typeof entry.code !== "string" ||
      createHash("sha256").update(entry.code).digest("hex") !== sha256
    )
      throw new Error(`Pinned public disclosure source changed: ${file}`);
  }
  return capture;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const capture: Capture = { revision, license: "Apache-2.0", sources: {} };
  for (const [file, sha256] of Object.entries(sourcePins)) {
    const url = sourceUrl(file);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Public source capture failed: ${response.status} ${url}`);
    capture.sources[file] = { url, sha256, code: await response.text() };
  }
  verifySourceCapture(capture);
  await mkdir(new URL("../reference/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../reference/disclosure-source.json", import.meta.url),
    JSON.stringify(capture, null, 2) + "\n",
  );
}
