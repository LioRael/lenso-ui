import { build } from "esbuild";
import { readFile, mkdir, writeFile, copyFile, chmod } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateToolContract } from "../src/contract.mjs";

export async function buildDistribution(name, { artifactUrl, corePath } = {}) {
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
  validateToolContract(JSON.parse(bytes));
  for (const notice of ["LICENSE", "NOTICE.md"]) {
    try {
      await readFile(new URL(notice, packageRoot));
    } catch (cause) {
      throw new Error(`Distribution legal copy missing: packages/${name}/${notice}`, { cause });
    }
  }
  const dist = new URL("dist/", packageRoot);
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
  const nativeIndex = JSON.parse(
    await readFile(new URL("native-declarations.json", nativeRoot), "utf8"),
  );
  const nativeNotice = [
    "# Native declaration excerpts",
    "",
    "The contract extracts declaration descriptions and type information from the packages below.",
    "This is not a claim that their complete implementation source is bundled.",
    "Their original MIT/Apache terms and copyright notices remain applicable; Lenso's first-party MIT license does not replace them.",
    "",
  ];
  for (const entry of nativeIndex.packages) {
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
      "Embedded HeroUI-derived examples, reference documentation and StyleX maps retain Apache-2.0, Copyright 2025 NextUI Inc.",
      "The [full Apache text](./heroui-LICENSE.txt) and [pinned provenance/modification notice](./heroui-NOTICE.md) accompany this distribution.",
      "The provenance notice is Lenso-authored; the pinned upstream source contains no upstream NOTICE.",
      "Original applicable notices remain in embedded source. Modified derived source retains modification statements.",
      "",
      "Extracted native declaration descriptions and type information retain the terms listed in the [native declaration index](./native-declarations.md). Complete third-party implementations are not bundled merely by extracting their declarations.",
      "",
      ...(name === "cli"
        ? [
            "The bundled Babel parser retains its [full original MIT notice](./babel-parser-LICENSE).",
            "",
          ]
        : [
            "The MCP SDK and Zod are separately installed external dependencies, not bundled implementation code.",
            "",
          ]),
      "This package-local index reflects the repository's third-party scope policy and links only to legal texts shipped here.",
      "",
    ].join("\n"),
  );
  if (name === "cli")
    await copyFile(
      new URL("../node_modules/@babel/parser/LICENSE", import.meta.url),
      new URL("babel-parser-LICENSE", licenses),
    );
  const output = new URL(name === "cli" ? "cli.mjs" : "server.mjs", dist);
  await build({
    entryPoints: [
      fileURLToPath(new URL(name === "cli" ? "src/cli.mjs" : "src/server.mjs", packageRoot)),
    ],
    outfile: fileURLToPath(output),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node24",
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
              builder.onResolve({ filter: /\/tooling\/lenso-contracts\/index\.mjs$/ }, () => ({
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
}
