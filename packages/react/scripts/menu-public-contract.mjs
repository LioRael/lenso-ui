// Fresh current-source build and packed consumer; provider workspace code is never linked.
import assert from "node:assert/strict";
import { cp, mkdir, readdir, readFile, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

assert.equal(process.version, "v26.10.0");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, providerArgument] = process.argv.slice(2);
assert(
  scratchArgument && providerArgument,
  "Usage: node menu-public-contract.mjs <scratch> <provider>",
);
const scratch = resolve(scratchArgument);
const provider = resolve(providerArgument);
assert.notEqual(scratch, project);
assert.notEqual(scratch, provider);
const workspace = resolve(scratch, "current");
const consumer = resolve(scratch, "consumer");
const packages = ["styles", "react", "standard", "stylex-build"];
async function links(source, destination, workspaceLinks) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ([".bin", ".cache", ".vite", ".vite-temp", ".pnpm", "@lenso"].includes(entry.name)) continue;
    const target = resolve(destination, entry.name);
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(source, entry.name), target, false);
    else await symlink(resolve(source, entry.name), target);
  }
  if (workspaceLinks) {
    await mkdir(resolve(destination, "@lenso"), { recursive: true });
    for (const [name, folder] of [
      ["tokens", "styles"],
      ["ui", "react"],
      ["standard", "standard"],
      ["stylex-build", "stylex-build"],
    ])
      await symlink(resolve(workspace, "packages", folder), resolve(destination, "@lenso", name));
  }
}
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  assert.equal(result.status, 0, `${command} ${args.join(" ")}`);
  return result.stdout;
}
function tool(packageName, file, context = provider) {
  const require = createRequire(resolve(context, "package.json"));
  return resolve(dirname(require.resolve(`${packageName}/package.json`)), file);
}
await mkdir(workspace, { recursive: true });
for (const folder of packages)
  await cp(resolve(project, "packages", folder), resolve(workspace, "packages", folder), {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:node_modules|dist)(?:\/|$)/.test(path),
  });
for (const file of ["package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml", "tsconfig.base.json"])
  await cp(resolve(project, file), resolve(workspace, file));
await cp(resolve(project, "third-party"), resolve(workspace, "third-party"), { recursive: true });
await links(resolve(provider, "node_modules"), resolve(workspace, "node_modules"), true);
for (const folder of ["styles", "react", "stylex-build"])
  await links(
    resolve(provider, "packages", folder, "node_modules"),
    resolve(workspace, "packages", folder, "node_modules"),
    true,
  );
// The read-only provider predates workspace-local build-tool dependency links.
for (const [name, store] of [
  ["@stylexjs/babel-plugin", "@stylexjs+babel-plugin@0.19.0"],
  ["browserslist", "browserslist@4.28.8"],
  ["lightningcss", "lightningcss@1.33.0"],
  ["unplugin", "unplugin@2.3.11"],
]) {
  const target = resolve(workspace, "packages/stylex-build/node_modules", name);
  await mkdir(dirname(target), { recursive: true });
  await symlink(resolve(provider, "node_modules/.pnpm", store, "node_modules", name), target);
}
for (const folder of ["styles", "react"]) {
  const cwd = resolve(workspace, "packages", folder);
  const packageProvider = resolve(provider, "packages", folder);
  if (folder === "styles")
    run(process.execPath, ["src/components/typography/generate-prose.mjs"], cwd);
  run(
    process.execPath,
    [tool("tsdown", "dist/run.mjs", packageProvider), "--config", "tsdown.config.ts"],
    cwd,
  );
  run(
    process.execPath,
    [
      tool("typescript", "bin/tsc"),
      "-p",
      "tsconfig.build.json",
      "--emitDeclarationOnly",
      "--noEmit",
      "false",
      "--outDir",
      "dist",
    ],
    cwd,
  );
  run(
    process.execPath,
    [folder === "styles" ? "scripts/copy-css.mjs" : "scripts/copy-notices.mjs"],
    cwd,
  );
}
await mkdir(resolve(scratch, "packs"), { recursive: true });
await mkdir(resolve(consumer, "node_modules/@lenso"), { recursive: true });
await links(
  resolve(provider, "packages/react/node_modules"),
  resolve(consumer, "node_modules"),
  false,
);
await writeFile(resolve(consumer, "package.json"), '{"private":true,"type":"module"}\n');
for (const [folder, name] of [
  ["styles", "tokens"],
  ["react", "ui"],
]) {
  const cwd = resolve(workspace, "packages", folder);
  run("pnpm", ["pack", "--pack-destination", resolve(scratch, "packs")], cwd);
  const archive = resolve(scratch, "packs", `lenso-${name}-0.9.0.tgz`);
  const target = resolve(consumer, "node_modules/@lenso", name);
  await mkdir(target, { recursive: true });
  run("tar", ["-xzf", archive, "--strip-components=1", "-C", target], consumer);
  const manifest = JSON.parse(await readFile(resolve(target, "package.json"), "utf8"));
  assert.equal(manifest.version, "0.9.0");
  assert(!(await readdir(resolve(target, "dist/components"))).includes("dropdown"));
}
const runtime = `
import assert from "node:assert/strict";
import * as root from "@lenso/ui";
import { Menu, MenuRoot, MenuTrigger, MenuPopup } from "@lenso/ui/menu";
import { menuStyles } from "@lenso/tokens/menu";
assert.equal(root.Menu, Menu);
assert.equal(Menu.Root, MenuRoot);
assert.equal(Menu.Trigger, MenuTrigger);
assert.equal(Menu.Popup, MenuPopup);
assert(menuStyles.popup && menuStyles.positioner);
assert(!Object.keys(root).some(name => name.startsWith("Dropdown")));
for (const old of ["@lenso/ui/dropdown", "@lenso/tokens/dropdown"])
  await assert.rejects(import(old), {code: "ERR_MODULE_NOT_FOUND"});
console.log("PASS packed runtime Menu exports; old exports and subpaths absent");
`;
await writeFile(resolve(consumer, "runtime.mjs"), runtime);
run(process.execPath, ["runtime.mjs"], consumer);
await writeFile(
  resolve(consumer, "contract.tsx"),
  `
import * as React from "react";
import { Menu as RootMenu } from "@lenso/ui";
import { Menu, MenuTrigger, MenuPopup } from "@lenso/ui/menu";
import { menuStyles } from "@lenso/tokens/menu";
// @ts-expect-error Dropdown is intentionally absent in 0.9.
import { Dropdown } from "@lenso/ui";
// @ts-expect-error The old public UI module is intentionally absent.
import { Dropdown as Legacy } from "@lenso/ui/dropdown";
// @ts-expect-error The old public style module is intentionally absent.
import { dropdownStyles } from "@lenso/tokens/dropdown";
const ref = React.createRef<HTMLButtonElement>();
const popupRef = React.createRef<HTMLDivElement>();
const node = <RootMenu onOpenChange={(open, details) => void [open, details.reason]}>
  <MenuTrigger ref={ref} style={({open}) => ({opacity: open ? 1 : 0.5})}
    render={(props) => <button {...props}>Open</button>} />
  <Menu.Portal><Menu.Positioner><MenuPopup ref={popupRef} xstyle={menuStyles.popup}>
    <Menu.CheckboxItem onCheckedChange={(checked, details) => void [checked, details]} />
    <Menu.RadioGroup onValueChange={(value, details) => void [value, details]}>
      <Menu.RadioItem value="one" />
    </Menu.RadioGroup>
    <Menu.SubmenuRoot><Menu.SubmenuTrigger>More</Menu.SubmenuTrigger></Menu.SubmenuRoot>
    <Menu.Viewport />
  </MenuPopup></Menu.Positioner></Menu.Portal>
</RootMenu>;
void node;
`,
);
run(
  process.execPath,
  [
    tool("typescript", "bin/tsc"),
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--jsx",
    "react-jsx",
    "contract.tsx",
  ],
  consumer,
);
console.log("PASS packed strict TypeScript consumer; native refs/render/callbacks retained");
run(
  process.execPath,
  [
    tool("vitest", "vitest.mjs", resolve(provider, "packages/react")),
    "run",
    "src/components/menu/menu.browser.test.tsx",
  ],
  resolve(workspace, "packages/react"),
);
