import { build } from "esbuild";
import {
  readFile,
  mkdir,
  writeFile,
  copyFile,
  chmod,
  cp,
  lstat,
  readdir,
  rm,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateToolContract } from "../src/contract.ts";

interface BuildOptions {
  artifactUrl?: URL;
  corePath?: string;
  distUrl?: URL;
}
interface LicenseAsset {
  file: string;
  sha256: string;
  copyrights: string[];
}
interface NativeLicense {
  name: string;
  version: string;
  license: string;
  assets: LicenseAsset[];
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a native license record");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.length) throw new Error("Invalid native license text");
  return value;
}
function licenseIndex(value: unknown): NativeLicense[] {
  const packages = object(value)["packages"];
  if (!Array.isArray(packages)) throw new Error("Native license packages must be an array");
  return packages.map((input: unknown) => {
    const entry = object(input);
    const assets = entry["assets"];
    if (!Array.isArray(assets)) throw new Error("Native license assets must be an array");
    return {
      name: text(entry["name"]),
      version: text(entry["version"]),
      license: text(entry["license"]),
      assets: assets.map((input: unknown) => {
        const asset = object(input);
        const copyrights = asset["copyrights"];
        if (!Array.isArray(copyrights)) throw new Error("Missing original copyrights");
        return {
          file: text(asset["file"]),
          sha256: text(asset["sha256"]),
          copyrights: copyrights.map(text),
        };
      }),
    };
  });
}

async function verifySkillTree(directory: URL): Promise<void> {
  for (const name of await readdir(directory)) {
    const file = new URL(name, directory);
    const stat = await lstat(file);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile()))
      throw new Error(`Unsupported skill payload entry: ${file.href}`);
    if (stat.isDirectory()) await verifySkillTree(new URL(`${name}/`, directory));
  }
}

export async function buildDistribution(
  name: "cli" | "mcp",
  { artifactUrl, corePath, distUrl }: BuildOptions = {},
): Promise<void> {
  if (!["cli", "mcp"].includes(name)) throw new Error("Unknown distribution");
  const root = new URL("../../../", import.meta.url);
  const packageRoot = new URL(`packages/${name}/`, root);
  const artifact = artifactUrl ?? new URL("apps/docs/src/generated/lenso-contract.json", root);
  let bytes;
  try {
    bytes = await readFile(artifact);
  } catch (cause) {
    throw new Error(
      "Generate the production lenso-contract.json before building developer tools; no fixture fallback.",
      { cause },
    );
  }
  validateToolContract(JSON.parse(bytes.toString("utf8")));
  for (const notice of ["LICENSE", "NOTICE.md"]) {
    try {
      await readFile(new URL(notice, packageRoot));
    } catch (cause) {
      throw new Error(`Distribution legal copy missing: packages/${name}/${notice}`, { cause });
    }
  }
  const dist = distUrl ?? new URL("dist/", packageRoot);
  await mkdir(dist, { recursive: true });
  const licenses = new URL("licenses/", dist);
  await mkdir(licenses, { recursive: true });
  await copyFile(
    new URL("third-party/heroui/LICENSE.txt", root),
    new URL("heroui-LICENSE.txt", licenses),
  );
  const provenance = await readFile(new URL("third-party/heroui/NOTICE.md", root), "utf8");
  const originalReference = "See the accompanying `LICENSE.txt`.";
  if (!provenance.includes(originalReference))
    throw new Error("HeroUI provenance license reference changed; review distribution links.");
  await writeFile(
    new URL("heroui-NOTICE.md", licenses),
    provenance.replace(
      originalReference,
      "See the accompanying [Apache license](./heroui-LICENSE.txt).",
    ),
  );
  const nativeRoot = new URL("../licenses/", import.meta.url);
  const nativeIndex = licenseIndex(
    JSON.parse(await readFile(new URL("native-declarations.json", nativeRoot), "utf8")),
  );
  const nativeNotice = [
    "# Native declaration excerpts",
    "",
    "The contract extracts declaration descriptions and type information from the packages below.",
    "This is not a claim that their complete implementation source is bundled.",
    "Their original MIT/Apache terms and copyright notices remain applicable; Lenso's first-party MIT license does not replace them.",
    "",
  ];
  for (const entry of nativeIndex) {
    nativeNotice.push(`## ${entry.name} ${entry.version}`, "", `License: ${entry.license}.`, "");
    for (const asset of entry.assets) {
      if (!/^[a-zA-Z0-9.-]+$/.test(asset.file)) throw new Error("Unsafe native license filename");
      const original = await readFile(new URL(asset.file, nativeRoot));
      if (createHash("sha256").update(original).digest("hex") !== asset.sha256)
        throw new Error(`Original native license bytes changed: ${asset.file}`);
      await writeFile(new URL(asset.file, licenses), original);
      nativeNotice.push(`[Full original license and copyright notice](./${asset.file})`, "");
      nativeNotice.push(...asset.copyrights, "");
    }
  }
  await writeFile(new URL("native-declarations.md", licenses), nativeNotice.join("\n"));
  await writeFile(
    new URL("THIRD_PARTY_NOTICES.md", licenses),
    [
      "# Third-party notices and license scope",
      "",
      "The [first-party MIT license](../../LICENSE) covers original Lenso tooling only; it does not replace third-party terms.",
      "",
      "Embedded HeroUI-derived component implementation, examples, theme CSS, reference documentation and StyleX maps retain Apache-2.0, Copyright 2025 NextUI Inc.",
      "The [full Apache text](./heroui-LICENSE.txt) and [pinned provenance/modification notice](./heroui-NOTICE.md) accompany this distribution.",
      "The provenance notice is Lenso-authored; the pinned upstream source contains no upstream NOTICE.",
      "Original applicable notices remain in embedded source. Modified derived source retains modification statements.",
      "",
      "Extracted native declaration descriptions and type information retain the terms listed in the [native declaration index](./native-declarations.md). Complete third-party implementations are not bundled merely by extracting their declarations.",
      "",
      "The bundled Babel parser retains its [full original MIT notice](./babel-parser-LICENSE).",
      "",
      ...(name === "mcp"
        ? [
            "The MCP SDK and Zod are separately installed external dependencies, not bundled implementation code.",
            "",
          ]
        : []),
      "This package-local index reflects the repository's third-party scope policy and links only to legal texts shipped here.",
      "",
    ].join("\n"),
  );
  await copyFile(
    new URL("../node_modules/@babel/parser/LICENSE", import.meta.url),
    new URL("babel-parser-LICENSE", licenses),
  );
  if (name === "cli") {
    for (const skill of ["lenso-ui", "lenso-ui-design"]) {
      const source = new URL(`.agents/skills/${skill}/`, root);
      await verifySkillTree(source);
      for (const required of ["SKILL.md", "LICENSE.txt"]) await readFile(new URL(required, source));
      const target = new URL(`skills/${skill}/`, dist);
      await rm(target, { recursive: true, force: true });
      await cp(source, target, { recursive: true });
    }
  }
  const output = new URL(name === "cli" ? "cli.js" : "server.js", dist);
  await build({
    entryPoints: [
      fileURLToPath(new URL(name === "cli" ? "src/cli.ts" : "src/server.ts", packageRoot)),
    ],
    outfile: fileURLToPath(output),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node26",
    packages: "bundle",
    nodePaths: [fileURLToPath(new URL("../node_modules/", import.meta.url))],
    external: name === "mcp" ? ["@modelcontextprotocol/sdk/*", "zod"] : [],
    banner: {
      js: "#!/usr/bin/env node\nimport { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
    },
    legalComments: "linked",
    metafile: true,
    plugins: corePath
      ? [
          {
            name: "explicit-private-core-build-input",
            setup(builder) {
              builder.onResolve({ filter: /\/tooling\/lenso-contracts\/index\.ts$/ }, () => ({
                path: corePath,
              }));
            },
          },
        ]
      : [],
  }).then(async (result) => {
    for (const generated of Object.values(result.metafile.outputs)) {
      for (const dependency of generated.imports) {
        if (
          !dependency.path.startsWith("node:") &&
          !(name === "mcp" && /^(?:@modelcontextprotocol\/sdk\/|zod$)/.test(dependency.path))
        )
          throw new Error(`Unexpected installed runtime dependency: ${dependency.path}`);
      }
    }
    await writeFile(
      new URL("build-inputs.json", dist),
      JSON.stringify(result.metafile, null, 2) + "\n",
    );
  });
  await writeFile(new URL("lenso-contract.json", dist), bytes);
  await chmod(output, 0o755);
  // Remove only the old generated entrypoints after a successful replacement.
  const legacy = name === "cli" ? "cli.mjs" : "server.mjs";
  await rm(new URL(legacy, dist), { force: true });
  await rm(new URL(`${legacy}.LEGAL.txt`, dist), { force: true });
}
