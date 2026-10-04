import assert from "node:assert/strict";
import { readFile, mkdir, writeFile, mkdtemp, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join, resolve, posix } from "node:path";
import { createHash } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { buildDistribution } from "../../cli/scripts/distribution.mjs";
import {
  resolveDoc,
  resolveExample,
  resolveStyle,
} from "../../../tooling/lenso-contracts/index.mjs";
import { validateToolContract } from "../../cli/src/contract.mjs";

const root = new URL("../../../", import.meta.url);
const results = new URL("durabletest-results/lenso-devtools/", root);
const args = process.argv.slice(2);
if (args.length && (args.length !== 4 || args[0] !== "--contract" || args[2] !== "--core"))
  throw new Error(
    "Use no arguments for canonical production inputs, or --contract <staged-production-json> --core <staged-private-core>",
  );
const artifactUrl = args.length
  ? pathToFileURL(resolve(args[1]))
  : new URL("apps/docs/src/generated/lenso-contract.json", root);
const corePath = args.length ? resolve(args[3]) : undefined;
if (corePath && process.env.LENSO_TEST_CONTRACT_CORE !== corePath)
  throw new Error(
    "Staged acceptance needs the test-only register hook and matching LENSO_TEST_CONTRACT_CORE; no runtime override is installed.",
  );
await mkdir(results, { recursive: true });
const artifact = validateToolContract(JSON.parse(await readFile(artifactUrl)));
await buildDistribution("cli", { artifactUrl, corePath });
await buildDistribution("mcp", { artifactUrl, corePath });
const packed = [];
const packSizes = [];
const legalAudits = [];
const nativeLicenses = JSON.parse(
  await readFile(new URL("packages/cli/licenses/native-declarations.json", root), "utf8"),
);
for (const name of ["cli", "mcp"]) {
  const result = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", fileURLToPath(results)],
      {
        cwd: fileURLToPath(new URL(`packages/${name}/`, root)),
        encoding: "utf8",
      },
    ),
  )[0];
  for (const file of [
    "dist/lenso-contract.json",
    "LICENSE",
    "NOTICE.md",
    "dist/licenses/heroui-LICENSE.txt",
    "dist/licenses/heroui-NOTICE.md",
  ])
    assert.ok(
      result.files.some((entry) => entry.path === file),
      `${name}: ${file} is missing`,
    );
  const members = new Set(result.files.map((entry) => entry.path));
  const archive = fileURLToPath(new URL(result.filename, results));
  const memberBytes = (file) =>
    execFileSync("tar", ["-xOf", archive, `package/${file}`], { maxBuffer: 32 * 1024 * 1024 });
  let checkedLinks = 0;
  for (const file of members) {
    if (file !== "NOTICE.md" && !/^dist\/licenses\/.*\.md$/.test(file)) continue;
    for (const match of memberBytes(file)
      .toString("utf8")
      .matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:)/.test(href)) continue;
      const relative = decodeURIComponent(href.split(/[?#]/)[0]);
      const target = relative ? posix.normalize(posix.join(posix.dirname(file), relative)) : file;
      assert.ok(
        !relative.startsWith("/") && members.has(target),
        `${name}: broken tarball-local link ${file} → ${href}`,
      );
      checkedLinks++;
    }
  }
  let nativeLicenseFiles = 0;
  for (const entry of nativeLicenses.packages) {
    for (const asset of entry.assets) {
      const bytes = memberBytes(`dist/licenses/${asset.file}`);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
      nativeLicenseFiles++;
    }
  }
  assert.equal(
    memberBytes("LICENSE").toString("utf8"),
    await readFile(new URL(`packages/${name}/LICENSE`, root), "utf8"),
  );
  assert.equal(
    memberBytes("dist/licenses/heroui-LICENSE.txt").toString("utf8"),
    await readFile(new URL("third-party/heroui/LICENSE.txt", root), "utf8"),
  );
  const packageMetadata = JSON.parse(memberBytes("package.json"));
  assert.equal(packageMetadata.license, "MIT");
  legalAudits.push({
    package: name,
    checkedLinks,
    nativeLicenseFiles,
    originalLicenseBytes: "verified",
  });
  packed.push(result.filename);
  packSizes.push({
    filename: result.filename,
    packedBytes: result.size,
    unpackedBytes: result.unpackedSize,
  });
}
const isolated = await mkdtemp(join(tmpdir(), "lenso-packed-acceptance-"));
await writeFile(
  `${isolated}/package.json`,
  '{"name":"packed-devtools-acceptance","private":true,"type":"module"}\n',
);
execFileSync(
  "npm",
  [
    "install",
    "--ignore-scripts",
    "--package-lock=false",
    "--offline",
    "--no-audit",
    "--no-fund",
    ...packed.map((name) => fileURLToPath(new URL(name, results))),
  ],
  { cwd: isolated, stdio: "pipe" },
);
const cli = `${isolated}/node_modules/@lenso/cli/dist/cli.mjs`;
const mcp = `${isolated}/node_modules/@lenso/mcp/dist/server.mjs`;
const installedModules = await readdir(`${isolated}/node_modules`);
for (const name of ["react", "next", "typescript", "esbuild"])
  assert.ok(!installedModules.includes(name), `Unexpected runtime dependency: ${name}`);
assert.deepEqual((await readdir(`${isolated}/node_modules/@lenso`)).sort(), ["cli", "mcp"]);
const installedContract = [];
for (const name of ["cli", "mcp"])
  installedContract.push(
    await readFile(`${isolated}/node_modules/@lenso/${name}/dist/lenso-contract.json`, "utf8"),
  );
assert.equal(installedContract[0], installedContract[1]);
const cliStarted = performance.now();
const metadata = JSON.parse(
  execFileSync(process.execPath, [cli, "metadata", "--json"], { cwd: isolated, encoding: "utf8" }),
);
const cliMetadataStartupMs = performance.now() - cliStarted;
assert.equal(metadata.digest, artifact.digest);
assert.equal(
  JSON.parse(
    execFileSync(process.execPath, [cli, "list", "--json"], { cwd: isolated, encoding: "utf8" }),
  ).length,
  Object.keys(artifact.api.families).length,
);
assert.equal(
  execFileSync(process.execPath, [cli, "docs", "Menu"], {
    cwd: isolated,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }),
  resolveDoc(
    artifact,
    artifact.docs.find((doc) => doc.slug.split("/").at(-1) === "menu" && doc.locale === "en"),
  ).markdown,
);
for (const framework of ["vite", "next"]) {
  const project = await mkdtemp(join(tmpdir(), `lenso-packed-${framework}-`));
  const original =
    JSON.stringify(
      {
        name: `packed-${framework}-starter`,
        private: true,
        type: "module",
        preservedMetadata: { owner: "caller" },
        scripts:
          framework === "next"
            ? { dev: "next dev", build: "next build" }
            : { dev: "vite", build: "vite build" },
        dependencies: {
          react: "19.2.4",
          "react-dom": "19.2.4",
          ...(framework === "next" ? { next: artifact.compatibility.next.version } : {}),
        },
        devDependencies:
          framework === "vite"
            ? { vite: artifact.compatibility.vite.testedVersion, "@vitejs/plugin-react": "6.0.1" }
            : {},
      },
      null,
      2,
    ) + "\n";
  await writeFile(join(project, "package.json"), original);
  const invoke = (...args) =>
    execFileSync(process.execPath, [cli, ...args], {
      cwd: project,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  const dryRun = JSON.parse(invoke("init", "--framework", framework, "--json"));
  assert.deepEqual(dryRun.conflicts, []);
  assert.equal(dryRun.dryRun, true);
  assert.deepEqual(await readdir(project), ["package.json"]);
  assert.equal(await readFile(join(project, "package.json"), "utf8"), original);
  const written = JSON.parse(invoke("init", "--framework", framework, "--write", "--json"));
  assert.equal(written.applied, true);
  assert.deepEqual(
    JSON.parse(await readFile(join(project, "package.json"), "utf8")).preservedMetadata,
    { owner: "caller" },
  );
  await writeFile(join(project, "entry.tsx"), 'import "./lenso.theme.css";\n');
  const beforeCheck = await readdir(project);
  const checked = JSON.parse(invoke("check", "--json"));
  assert.deepEqual(checked.diagnostics, []);
  assert.deepEqual(checked.skipped, []);
  assert.deepEqual(await readdir(project), beforeCheck);
  const config = `${framework}.config.mjs`;
  await writeFile(join(project, config), "export default { callerOwned: true };\n");
  let refused;
  try {
    invoke("init", "--framework", framework, "--write", "--json");
  } catch (error) {
    refused = JSON.parse(error.stdout);
  }
  assert.equal(refused.applied, false);
  assert.match(refused.conflicts.join("\n"), /Refusing overwrite/);
  assert.equal(
    await readFile(join(project, config), "utf8"),
    "export default { callerOwned: true };\n",
  );
}
const client = new Client({ name: "packed-acceptance", version: "0.1.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [mcp],
  cwd: isolated,
  stderr: "pipe",
});
let stderr = "";
transport.stderr?.on("data", (chunk) => {
  stderr += chunk;
});
const mcpStarted = performance.now();
await client.connect(transport);
const mcpInitializeStartupMs = performance.now() - mcpStarted;
const beforeRequests = await readdir(isolated);
try {
  const { tools } = await client.listTools();
  assert.equal(tools.length, 6);
  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.openWorldHint, false);
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
  for (const [name, args] of [
    ["list_components", {}],
    ["get_component_api", { component: "Menu" }],
    ["get_component_examples", { component: "Menu" }],
    ["get_component_styles", { component: "Menu" }],
    ["search_documentation", { query: "Menu" }],
    ["get_documentation", { slug: "menu" }],
  ]) {
    const result = await client.callTool({ name, arguments: args });
    assert.ok(!result.isError, JSON.stringify(result));
    const view = JSON.parse(result.content[0].text);
    assert.equal(view.metadata.digest, artifact.digest);
    if (name === "list_components")
      assert.equal(view.data.length, Object.keys(artifact.api.families).length);
    if (name === "get_component_api") {
      for (const part of view.data.parts) {
        const source = artifact.api.families.menu.parts.find((entry) => entry.name === part.name);
        assert.deepEqual(
          part.properties.map((row) => row.id),
          source.properties,
        );
        for (const row of part.properties)
          assert.deepEqual(row, { id: row.id, ...artifact.api.properties[row.id] });
      }
    }
    if (name === "get_component_examples") {
      const expected = artifact.examples.filter(
        (entry) =>
          entry.locale === "en" &&
          (entry.file.startsWith("en/menu/") || entry.file.startsWith("menu/")),
      );
      assert.ok(expected.length > 0);
      assert.deepEqual(
        view.data,
        expected.map((entry) => resolveExample(artifact, entry)),
      );
    }
    if (name === "get_component_styles")
      assert.deepEqual(
        view.data,
        artifact.styles
          .filter((entry) => entry.family === "menu")
          .map((entry) => resolveStyle(artifact, entry)),
      );
    if (name === "get_documentation")
      assert.deepEqual(
        view.data,
        resolveDoc(
          artifact,
          artifact.docs.find(
            (entry) => entry.locale === "en" && entry.slug.split("/").at(-1) === "menu",
          ),
        ),
      );
    if (name === "search_documentation") assert.ok(view.data.length > 0 && view.data.length <= 10);
  }
  for (const args of [
    { component: "Dropdown" },
    { component: "../../private" },
    { component: "Menu", locale: "fr" },
    { component: "Menu", lensoVersion: "latest" },
    { component: "Menu", digest: "bad" },
    {
      component: "Menu",
      path: join(isolated, "SHOULD_NOT_EXIST"),
      command: "touch SHOULD_NOT_EXIST",
    },
    { component: "Menu", url: "https://example.invalid" },
  ])
    assert.equal(
      (await client.callTool({ name: "get_component_examples", arguments: args })).isError,
      true,
    );
  assert.deepEqual(await readdir(isolated), beforeRequests);
  for (const name of ["cli", "mcp"])
    assert.equal(
      await readFile(`${isolated}/node_modules/@lenso/${name}/dist/lenso-contract.json`, "utf8"),
      installedContract[0],
    );
  assert.equal(stderr, "");
} finally {
  await client.close();
}
const result = {
  node: process.version,
  digest: artifact.digest,
  lensoVersion: artifact.lensoVersion,
  families: Object.keys(artifact.api.families).length,
  packages: packed,
  artifactSource: fileURLToPath(artifactUrl),
  artifactBytes: Buffer.byteLength(installedContract[0]),
  packSizes,
  legalAudits,
  cliMetadataStartupMs,
  mcpInitializeStartupMs,
  isolated,
  status: "passed",
};
await writeFile(new URL("packed-acceptance.json", results), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
