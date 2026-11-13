import assert from "node:assert/strict";
import { test } from "bun:test";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { build } from "vite";
import stylex from "@stylexjs/unplugin";
import { legalPackages, validateLegalPackage } from "../../scripts/legal-attribution.ts";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const run = promisify(execFile);
test("installed packages preserve consumer exports, types, SSR and production assets", async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), "lenso-installed-consumer-")));
  const require = createRequire(import.meta.url);
  const version = (name: string): string =>
    (require(`${name}/package.json`) as { version: string }).version;

  try {
    for (const name of ["tokens", "glass", "primitives", "ui"]) {
      // Pack existing build outputs; no package builds or workspace dependency links.
      await run("bun", ["pm", "pack", "--destination", directory, "--ignore-scripts"], {
        cwd: resolve(workspace, "packages", name),
      });
    }
    const tarballs = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
    assert.equal(tarballs.length, 4);
    const uiDependencies = (
      JSON.parse(await readFile(resolve(workspace, "packages/ui/package.json"), "utf8")) as {
        dependencies: Record<string, string>;
      }
    ).dependencies;
    const packages = Object.fromEntries(
      tarballs.map((file) => {
        const name = file.startsWith("lenso-ui-")
          ? "@lenso/ui"
          : file.startsWith("lenso-tokens-")
            ? "@lenso/tokens"
            : file.startsWith("lenso-primitives-")
              ? "@lenso/primitives"
              : "@lenso/glass";
        return [name, `file:./${file}`];
      }),
    );
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({
        name: "lenso-installed-consumer",
        private: true,
        type: "module",
        overrides: packages,
        dependencies: {
          ...packages,
          "@ui-sdk/react": uiDependencies["@ui-sdk/react"],
          "@ui-sdk/core": uiDependencies["@ui-sdk/core"],
          react: version("react"),
          "react-dom": version("react-dom"),
          "@stylexjs/stylex": version("@stylexjs/stylex"),
          "@types/react": version("@types/react"),
          "@types/react-dom": version("@types/react-dom"),
          typescript: version("typescript"),
        },
      }),
    );
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], { cwd: directory });
    const specifiers = [
      "@lenso/ui",
      "@lenso/ui/button",
      "@lenso/ui/command",
      "@ui-sdk/react/command",
      "@lenso/primitives/sidebar",
      "@lenso/primitives/sidebar/core",
      "@lenso/primitives/section-index",
      "@lenso/primitives/section-index/core",
      "@lenso/primitives/swipe-actions",
      "@lenso/primitives/swipe-actions/core",
      "@lenso/primitives/list/core",
      "@lenso/primitives/model-control",
      "@lenso/primitives/wheel-picker/core",
      "@lenso/tokens/command",
      "@lenso/ui/glass-toggle-button",
      "@lenso/ui/menu",
      "@lenso/ui/navigation-bar",
      "@lenso/ui/page-control",
      "@lenso/ui/swipe-actions",
      "@lenso/ui/wheel-picker",
      "@lenso/ui/list",
      "@lenso/ui/refresh-control",
      "@lenso/tokens/refresh-control",
      "@lenso/ui/segmented-control",
      "@lenso/ui/section-index",
      "@lenso/ui/hooks",
      "@lenso/ui/agent",
      "@lenso/ui/icons",
      "@lenso/glass",
      "@lenso/glass/react",
      "@lenso/glass/motion",
      "@lenso/tokens/styles.css",
      "@lenso/tokens/button",
      "@lenso/tokens/glass-toggle-button",
      "@lenso/tokens/menu",
      "@lenso/tokens/navigation-bar",
      "@lenso/tokens/swipe-actions",
      "@lenso/tokens/wheel-picker",
      "@lenso/tokens/segmented-control",
      "@lenso/tokens/section-index",
      "react",
      "react-dom/server",
    ];
    // ESM-only exports must be resolved with import conditions from the installation.
    const resolved = await run(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `console.log(JSON.stringify(Object.fromEntries(${JSON.stringify(specifiers)}.map(id => [id, import.meta.resolve(id)]))))`,
      ],
      { cwd: directory },
    );
    const urls: Record<string, string> = JSON.parse(resolved.stdout);
    const installedImport = (specifier: string): string => {
      const url = urls[specifier];
      assert(url, `Missing ESM resolution for ${specifier}`);
      assert(
        fileURLToPath(url).startsWith(directory + sep),
        `${specifier} must resolve from installation`,
      );
      return url;
    };
    for (const specifier of specifiers) {
      await readFile(fileURLToPath(installedImport(specifier)));
    }
    const packageRoots: Record<string, URL> = {
      ui: new URL("../", installedImport("@lenso/ui")),
      glass: new URL("../", installedImport("@lenso/glass")),
      tokens: new URL("../", installedImport("@lenso/tokens/styles.css")),
    };
    for (const entry of legalPackages) {
      await validateLegalPackage(packageRoots[entry.directory]!, entry);
    }
    const sidebarCore = await import(installedImport("@lenso/primitives/sidebar/core"));
    const coreInstance = sidebarCore.sidebar({ id: "installed-sidebar-core", defaultOpen: false });
    try {
      assert.equal(coreInstance.api.setOpen(true), true);
      assert.equal(coreInstance.api.isOpen(), true);
    } finally {
      coreInstance.destroy();
    }
    const primitiveFiles = await readdir(
      new URL("dist/", new URL("../../", installedImport("@lenso/primitives/sidebar"))),
    );
    assert.deepEqual(
      primitiveFiles.filter((file) => /^(command|resize-handle|data-grid)$/.test(file)),
      [],
    );
    // Check the installed tarball: stale dist files can survive a source-only cleanup.
    const glassRoot = packageRoots["glass"]!;
    const glassFiles = await readdir(glassRoot, { recursive: true });
    assert.deepEqual(
      glassFiles.filter((file) =>
        /(?:\.rs$|\.wasm$|Cargo\.(?:toml|lock)$|generated[\\/](?:binary|runtime)(?:\.|$))/.test(
          file,
        ),
      ),
      [],
      "Rust/Wasm comparison files must stay outside the published package",
    );
    for (const file of glassFiles.filter((file) => file.endsWith(".js")))
      assert.equal(
        (await readFile(new URL(file.split(sep).join("/"), glassRoot), "utf8")).includes(
          "WebAssembly",
        ),
        false,
        `Unexpected Wasm code in ${file}`,
      );
    for (const file of ["quad.vert", "blur.frag", "ios27.frag", "NOTICE.md", "LICENSE.txt"])
      await readFile(new URL(`dist/source/shaders/${file}`, glassRoot));
    await readFile(new URL("dist/source/scripts/generate-shaders.ts", glassRoot));
    await writeFile(
      join(directory, "index.html"),
      '<html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
    );
    await writeFile(
      join(directory, "main.tsx"),
      `
import {createRoot} from "react-dom/client";
import {GlassButton, ButtonGroup, ToggleButtonGroup, Modal, ThemeScope} from "@lenso/ui";
import {GlassToggleButton} from "@lenso/ui/glass-toggle-button";
import {GlassContainer} from "@lenso/ui/glass-container";
import {Button as SubpathButton} from "@lenso/ui/button";
import {Menu, MenuTrigger, MenuContent} from "@lenso/ui/menu";
import {menuStyles} from "@lenso/tokens/menu";
import {NavigationBar} from "@lenso/ui/navigation-bar";
import {PageControl} from "@lenso/ui/page-control";
import {SwipeActions} from "@lenso/ui/swipe-actions";
import {WheelPicker} from "@lenso/ui/wheel-picker";
import {RefreshControl} from "@lenso/ui/refresh-control";
import {List} from "@lenso/ui/list";
import {DatePicker} from "@lenso/ui/date-picker";
import {DateField, createDateFieldController} from "@lenso/ui/date-field";
import {ColorPicker} from "@lenso/ui/color-picker";
import {ColorArea} from "@lenso/ui/color-area";
import {ColorSlider} from "@lenso/ui/color-slider";
const dateController = createDateFieldController();
import {SegmentedControl} from "@lenso/ui/segmented-control";
import {SectionIndex} from "@lenso/ui/section-index";
import {Command} from "@lenso/ui/command";
import {ListBox} from "@lenso/ui/list-box";
import {Command as SdkCommand, CommandInput as SdkCommandInput, CommandList as SdkCommandList} from "@ui-sdk/react/command";
import {Sidebar as PrimitiveSidebar} from "@lenso/primitives/sidebar";
import {createSidebarController} from "@lenso/primitives/sidebar/core";
const sidebarController = createSidebarController();
const sidebarNode = <PrimitiveSidebar.Root aria-label="Installed navigation panel" controller={sidebarController} onOpenChange={(open, details)=>{if(open) details.cancel()}}><PrimitiveSidebar.Trigger>Toggle panel</PrimitiveSidebar.Trigger><PrimitiveSidebar.Panel><PrimitiveSidebar.Item href="#installed" selected>Installed destination</PrimitiveSidebar.Item></PrimitiveSidebar.Panel></PrimitiveSidebar.Root>;
void sidebarNode;
const menuNode = <Menu.Root><MenuTrigger>Menu</MenuTrigger><MenuContent xstyle={menuStyles.popup} /></Menu.Root>;
void menuNode;
import * as stylex from "@stylexjs/stylex";
import "@lenso/tokens/styles.css";
const styles = stylex.create({width: (value: number) => ({width: value})});
createRoot(document.getElementById("root")!).render(
  <ThemeScope theme="dark"><Modal.Root><Modal.Trigger render={<GlassButton data-testid="installed-glass" xstyle={styles.width(180)} />}>Open installed modal</Modal.Trigger>
    <Modal.Backdrop/><Modal.Content><Modal.Title>Installed package dialog</Modal.Title>
      <Modal.Close render={<SubpathButton />}>Close installed modal</Modal.Close>
    </Modal.Content>
  </Modal.Root><ButtonGroup size="sm"><GlassButton>Previous</GlassButton><GlassButton>Next</GlassButton></ButtonGroup>
  <ToggleButtonGroup multiple defaultValue={["bold"]}><GlassToggleButton value="bold">Bold</GlassToggleButton><GlassToggleButton value="italic">Italic</GlassToggleButton></ToggleButtonGroup>
  <GlassContainer spacing={18} style={{display: "flex", gap: 12, padding: 24}}><GlassButton>Save</GlassButton><GlassContainer.Item elastic render={<button type="button" />} style={{width: 64, height: 50, borderRadius: 16}}>Add</GlassContainer.Item></GlassContainer>
  <RefreshControl onRefresh={async()=>{}}><RefreshControl.Trigger/><RefreshControl.Viewport><List editing value={["one"]} onValueChange={(value, details)=>{void value; details.cancel()}} onReorder={details=>{void details.targetKey}}><List.Item itemKey="one" textValue="One"><List.Title>One</List.Title></List.Item></List></RefreshControl.Viewport></RefreshControl>
  <NavigationBar title="Installed navigation" large={false} level={2} />
  <PageControl count={20} variant="plain" /><PageControl count={3} variant="prominent" />
  <SwipeActions endActions={[{id: "delete", label: "Delete", onAction: () => {}}]}>Installed row</SwipeActions>
  <DatePicker aria-label="Installed picker"><DatePicker.Trigger>Choose installed date</DatePicker.Trigger><DatePicker.Popover side="bottom" align="start"><DatePicker.Title>Installed calendar</DatePicker.Title><DatePicker.Close>Cancel installed date</DatePicker.Close></DatePicker.Popover></DatePicker>
  <DateField aria-label="Installed date" controller={dateController} onValueChange={(_value,details)=>details.cancel()}><DateField.Input>{segment=><DateField.Segment segment={segment}/>}</DateField.Input></DateField>
  <ColorPicker aria-label="Installed color" space="hsl" defaultValue="hsl(120 100% 50%)"><ColorArea><ColorArea.Thumb/></ColorArea><ColorSlider channel="hue"><ColorSlider.Track><ColorSlider.Thumb/></ColorSlider.Track></ColorSlider></ColorPicker>
  <WheelPicker aria-label="Installed wheel" options={[{value: "one", label: "One"}]} name="wheel" />
  <SegmentedControl aria-label="Installed filter" items={[{value:"all",label:"All"}]} defaultValue="all" name="filter" />
  <SectionIndex aria-label="Installed index" items={[{value:"a",label:"A",href:"#a"}]} />
  <ListBox<string, true> multiple defaultValue={["alpha"]} name="topics"><ListBox.Item value="alpha" label="Alpha">{state => state.selected ? "Chosen" : "Alpha"}</ListBox.Item></ListBox>
<Command xstyle={styles.width(320)}><Command.Input aria-label="Styled commands"/><Command.List><Command.Item value="Settings">Settings</Command.Item></Command.List></Command>
  <SdkCommand items={["Open"]}><SdkCommandInput aria-label="Unstyled commands"/><SdkCommandList/></SdkCommand>
  </ThemeScope>);
`,
    );
    await writeFile(
      join(directory, "retired-export.ts"),
      '// @ts-expect-error The retired Dropdown export is absent.\nimport {Dropdown} from "@lenso/ui";\nvoid Dropdown;\nimport {DatePicker} from "@lenso/ui/date-picker";\n// @ts-expect-error Native Popover parts replace the old Dialog wrapper.\nvoid DatePicker.Dialog;\n',
    );
    await writeFile(join(directory, "css.d.ts"), 'declare module "*.css";\n');
    await writeFile(
      join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          target: "ES2022",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["main.tsx", "retired-export.ts", "css.d.ts"],
      }),
    );
    await run(process.execPath, ["check", "--no-script", "--noEmit"], { cwd: directory });
    const options = {
      dev: false,
      runtimeInjection: false,
      useCSSLayers: false,
      lightningcssOptions: { exclude: 4 },
      unstable_moduleResolution: { type: "commonJS" as const, rootDir: directory },
    };
    await build({
      root: directory,
      configFile: false,
      logLevel: "error",
      plugins: [stylex.vite(options)],
    });
    await writeFile(
      join(directory, "server.tsx"),
      `
import assert from "node:assert/strict";
import {renderToString} from "react-dom/server";
import {Sidebar as PrimitiveSidebar} from "@lenso/primitives/sidebar";
const sidebarMarkup = renderToString(<PrimitiveSidebar.Root aria-label="SSR navigation" defaultOpen={false}><PrimitiveSidebar.Trigger>Open navigation</PrimitiveSidebar.Trigger><PrimitiveSidebar.Panel>SSR panel</PrimitiveSidebar.Panel></PrimitiveSidebar.Root>);
assert.match(sidebarMarkup, /data-slot="sidebar"/);
assert.match(sidebarMarkup, /aria-expanded="false"/);
assert.match(sidebarMarkup, /<aside[^>]* hidden=""/);
import {Command} from "@lenso/ui/command";
import {Command as SdkCommand, CommandInput as SdkCommandInput, CommandList as SdkCommandList} from "@ui-sdk/react/command";
const unstyledCommand = renderToString(<SdkCommand items={[]}><SdkCommandInput aria-label="Raw commands"/><SdkCommandList/></SdkCommand>);
assert.ok(unstyledCommand.includes('role="combobox"'));
assert.ok(unstyledCommand.includes('data-slot="command"'));
assert.ok(!unstyledCommand.includes('class="'));
assert.ok(renderToString(<Command items={[]}><Command.Input aria-label="Styled commands"/></Command>).includes('data-lenso-slot="command"'));
import {Button, Menu, GlassContainer, GlassToggleButton, ToggleButtonGroup} from "@lenso/ui";
import {GlassToggleButton as SubpathToggle} from "@lenso/ui/glass-toggle-button";
import {GlassContainer as SubpathContainer} from "@lenso/ui/glass-container";
import {SwipeActions, WheelPicker} from "@lenso/ui";
import {SwipeActions as SubpathSwipe} from "@lenso/ui/swipe-actions";
import {WheelPicker as SubpathWheel} from "@lenso/ui/wheel-picker";
import {SegmentedControl, SectionIndex} from "@lenso/ui";
import {SegmentedControl as SubpathSegments} from "@lenso/ui/segmented-control";
import {SectionIndex as SubpathIndex} from "@lenso/ui/section-index";
import {Menu as SubpathMenu, MenuTrigger, MenuContent} from "@lenso/ui/menu";
import {menuStyles} from "@lenso/tokens/menu";
import {RefreshControl, List} from "@lenso/ui";
import {RefreshControl as SubpathRefresh} from "@lenso/ui/refresh-control";
assert.equal(RefreshControl, SubpathRefresh);
assert.match(renderToString(<List aria-label="SSR selection" editing value={["one"]}><List.Item itemKey="one" textValue="One">One</List.Item></List>), /aria-checked="true"/);
assert.match(renderToString(<RefreshControl onRefresh={()=>{}}><RefreshControl.Trigger/><RefreshControl.Viewport><List editing><List.Item itemKey="one" textValue="One">One</List.Item></List></RefreshControl.Viewport></RefreshControl>), /Select One/);
assert.equal(Menu, SubpathMenu);
assert.equal(GlassToggleButton, SubpathToggle);
assert.equal(GlassContainer, SubpathContainer);
assert.equal(SwipeActions, SubpathSwipe);
assert.equal(WheelPicker, SubpathWheel);
assert.equal(SegmentedControl, SubpathSegments);
assert.equal(SectionIndex, SubpathIndex);
assert.match(renderToString(<SegmentedControl aria-label="Server filter" items={[{value:"all",label:"All"}]} defaultValue="all" />), /segmented-control/);
assert.match(renderToString(<SectionIndex items={[{value:"a",label:"A",href:"#a"}]} />), /href="#a"/);
assert.equal(Menu.Trigger, MenuTrigger);
assert.equal(Menu.Content, MenuContent);
assert(menuStyles.popup && menuStyles.positioner);
export const markup = renderToString(<><Button>Server action</Button><ToggleButtonGroup multiple defaultValue={["bold"]}><SubpathToggle value="bold">Bold</SubpathToggle></ToggleButtonGroup><SubpathContainer><GlassContainer.Item>Server glass</GlassContainer.Item></SubpathContainer><SubpathSwipe endActions={[{id: "archive", label: "Archive", onAction: () => {}}]}>Server swipe row</SubpathSwipe><SubpathWheel aria-label="Server wheel" options={[{value: "one", label: "One"}]} /></>);
`,
    );
    await build({
      root: directory,
      configFile: false,
      logLevel: "error",
      plugins: [stylex.vite(options)],
      ssr: { noExternal: ["@lenso/ui", "@lenso/glass", "@lenso/tokens"] },
      build: { ssr: join(directory, "server.tsx"), outDir: "dist-server" },
    });
    const { markup } = await import(pathToFileURL(join(directory, "dist-server/server.js")).href);
    assert.match(markup, /<button/);
    assert.match(markup, /Server action/);
    assert.match(markup, /Server swipe row/);
    assert.match(markup, /Server wheel/);
    assert.match(markup, /aria-pressed="true"/);
    assert.match(markup, /data-lenso-slot="glass-container"/);
    assert.match(markup, /Server glass/);
    await run(
      process.execPath,
      [
        "--eval",
        `
      import assert from "node:assert/strict";
      for (const id of ["@lenso/ui/dropdown", "@lenso/tokens/dropdown", "@lenso/primitives/command", "@lenso/primitives/resize-handle", "@lenso/primitives/data-grid"])
        await assert.rejects(import(id));
    `,
      ],
      { cwd: directory },
    );

    const built = await readdir(join(directory, "dist", "assets"));
    assert(
      built.some((file) => file.endsWith(".js")),
      "consumer JavaScript was not built",
    );
    assert(
      built.some((file) => file.endsWith(".css")),
      "consumer CSS was not built",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 180000);
