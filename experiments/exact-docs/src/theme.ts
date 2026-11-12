import { cp, mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const framework = path.resolve(import.meta.dirname, "..");
const ui = path.resolve(framework, "../../packages/ui-exact");
const primitives = path.resolve(framework, "../../packages/primitives-exact");

export async function stageThemeContracts(app: string) {
  for (const [source, name] of [
    [ui, "ui-exact"],
    [primitives, "primitives-exact"],
  ] as const) {
    const destination = path.join(app, "node_modules/@lenso", name);
    await mkdir(destination, { recursive: true });
    for (const entry of ["package.json", "index.contract", "components"])
      await cp(path.join(source, entry), path.join(destination, entry), { recursive: true });
  }
  await cp(
    path.join(framework, "themes/lenso/layout.contract"),
    path.join(app, "lenso-layout.contract"),
  );
  const { withLensoWeb } = await import("../../../packages/ui-exact/scripts/stage.ts");
  const manifest = path.join(app, "app.json");
  const configured = withLensoWeb(await Bun.file(manifest).json());
  const words = new Set([...configured.data, "docs-theme-part"]);
  for (const directory of [ui, primitives])
    for (const entry of [
      "index.contract",
      ...new Bun.Glob("components/**/*.contract").scanSync({ cwd: directory, onlyFiles: true }),
    ]) {
      if (entry.startsWith("node_modules/") || entry.includes(".cache/")) continue;
      for (const match of (await Bun.file(path.join(directory, entry)).text()).matchAll(
        /\bdata-([a-z][a-z0-9-]*)=/g,
      ))
        words.add(match[1]!);
    }
  await Bun.write(manifest, JSON.stringify({ ...configured, data: [...words] }, null, 2));
}

export async function stageThemeAssets(app: string, assets = path.join(ui, "dist")) {
  if (!(await Bun.file(path.join(assets, "web.css")).exists()))
    throw new Error(
      "Build @lenso/ui-exact before using the Lenso theme: bun run --cwd packages/ui-exact build",
    );
  for (const reserved of [
    "modules/web/docs-theme",
    "modules/web/lenso-ui",
    "modules/web/__exact_docs_user_index__.js",
  ]) {
    try {
      await stat(path.join(app, reserved));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
      throw error;
    }
    throw new Error(`Lenso theme asset path is reserved: ${reserved}`);
  }
  await cp(assets, path.join(app, "modules/web/lenso-ui"), { recursive: true });
  const require = createRequire(path.join(ui, "package.json"));
  const { build } = await import(require.resolve("vite"));
  const { default: stylex } = await import(require.resolve("@stylexjs/unplugin/vite"));
  const output = path.join(app, "modules/web/docs-theme");
  await build({
    configFile: false,
    root: framework,
    plugins: [
      stylex({
        dev: false,
        runtimeInjection: false,
        useCSSLayers: false,
        unstable_moduleResolution: { type: "commonJS" },
      }),
    ],
    build: {
      outDir: output,
      emptyOutDir: true,
      lib: {
        entry: path.join(framework, "themes/lenso/styles.ts"),
        formats: ["es"],
        fileName: () => "index.js",
      },
    },
  });
  const { cases } = await import(
    pathToFileURL(path.join(output, "index.js")).href + "?v=" + crypto.randomUUID()
  );
  let atomic = "";
  for (const file of new Bun.Glob("**/*.css").scanSync(output))
    atomic += await Bun.file(path.join(output, file)).text();
  const { initialCSS } = await import("../../../packages/ui-exact/scripts/initial-css.ts");
  const { default: postcss } = await import(require.resolve("postcss"));
  const css = postcss.parse(initialCSS(atomic, cases).replaceAll(":not([data-lenso-ready])", ""));
  css.walkRules(
    (rule: { parent?: { type: string; name?: string }; selector: string; selectors: string[] }) => {
      if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name ?? "")) return;
      rule.selector = rule.selectors
        .map((selector: string) => `#exact-root#exact-root ${selector}`)
        .join(",");
    },
  );
  // Use the same licensed font and fallback metrics as the existing Docs host.
  await cp(
    path.resolve(framework, "../../packages/docs/assets/fonts"),
    path.join(output, "fonts"),
    {
      recursive: true,
    },
  );
  const fontCSS = await Bun.file(
    path.resolve(framework, "../../packages/docs/src/font.css"),
  ).text();
  await Bun.write(
    path.join(output, "theme.css"),
    fontCSS.replaceAll("../dist/fonts/", "./fonts/") + "\n" + css.toString(),
  );
  const page = path.join(app, "modules/web/index.js");
  const existing = await Bun.file(page).exists();
  if (existing) await rename(page, path.join(app, "modules/web/__exact_docs_user_index__.js"));
  await Bun.write(
    page,
    `${existing ? `import * as user from './__exact_docs_user_index__.js';export * from './__exact_docs_user_index__.js';` : "const user={};"}
import {element as lensoElement,elementEnded as lensoEnded} from './lenso-ui/browser.js';
export function element(handle){if(handle.hatch === "lenso-ui")lensoElement(handle);else user.element?.(handle);}
export function elementEnded(handle){if(handle.hatch === "lenso-ui")lensoEnded(handle);else user.elementEnded?.(handle);}`,
  );
}

export async function linkThemeStyles(output: string) {
  const { linkWebStyles } = await import("../../../packages/ui-exact/scripts/stage.ts");
  await linkWebStyles(output);
  const css = await Bun.file(path.join(output, "modules/docs-theme/theme.css")).bytes();
  const hash = createHash("sha256").update(css).digest("hex");
  for (const file of new Bun.Glob("**/*.html").scanSync(output)) {
    const target = path.join(output, file),
      html = await Bun.file(target).text();
    if (!html.includes('id="exact-root"')) continue;
    await Bun.write(
      target,
      html.replace(
        /(<base\b[^>]*>)/,
        `$1<link rel="stylesheet" href="./modules/docs-theme/theme.css?v=${hash}" data-docs-theme-styles>`,
      ),
    );
  }
}
