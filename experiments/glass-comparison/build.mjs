import path from "node:path";
import { mkdir, cp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
const repo = path.resolve(import.meta.dirname, "../..");
const require = createRequire(path.join(repo, "packages/ui-exact/package.json"));
const { build } = await import(require.resolve("vite"));
const { default: stylex } = await import(require.resolve("@stylexjs/unplugin/vite"));
const root = import.meta.dirname,
  cache = path.join(root, ".cache");
await rm(cache, { recursive: true, force: true });
await mkdir(cache, { recursive: true });
const aliases = [
  {
    find: /^@lenso\/glass\/react$/,
    replacement: path.join(repo, "packages/glass/src/react/index.ts"),
  },
  {
    find: /^@lenso\/glass\/fusion$/,
    replacement: path.join(repo, "packages/glass/src/fusion-entry.ts"),
  },
  { find: /^@lenso\/glass$/, replacement: path.join(repo, "packages/glass/src/index.ts") },
  {
    find: /^@lenso\/tokens\/styles.css$/,
    replacement: path.join(repo, "packages/tokens/styles.css"),
  },
  {
    find: /^@lenso\/tokens\/materials$/,
    replacement: path.join(repo, "packages/tokens/src/materials/index.ts"),
  },
  {
    find: /^@lenso\/tokens\/(.+)$/,
    replacement: path.join(repo, "packages/tokens/src/components/$1/index.ts"),
  },
];
const instrument = {
  name: "glass-lifetime-receipts",
  enforce: "pre",
  transform(code, id) {
    if (id !== path.join(repo, "packages/glass/src/refraction.ts")) return;
    const signature =
      "export function attachGlass(element: HTMLElement, options: GlassOptions = {}): () => void {";
    if (!code.includes(signature)) throw new Error("Instrumentation signature drift");
    return (
      code
        .replace("function attachOptics(", "function benchAttachOptics(")
        .replace(
          signature,
          "function benchAttachGlass(element: HTMLElement, options: GlassOptions = {}): () => void {",
        ) +
      `
function attachOptics(element: HTMLElement, options: GlassOptions = {}): () => void {
 const b=(globalThis as any).glassBench;const id=b.ids.get(element);b.events.push({type:'optics-start',id,time:performance.now()});
 const stop=benchAttachOptics(element,options);return ()=>{b.events.push({type:'optics-stop',id,time:performance.now()});stop()};
}
export function attachGlass(element: HTMLElement, options: GlassOptions = {}): () => void {
 const w=globalThis as any; const b=w.glassBench??=( {events:[],next:0,ids:new WeakMap()} );
 let id=b.ids.get(element);if(!id){id=++b.next;b.ids.set(element,id)}
 if(location.search.includes('matched')) options={...options,liveBackdrop:false};
 b.events.push({type:'attach',id,time:performance.now(),liveBackdrop:!!options.liveBackdrop,profile:options.profileKey});
 const stop=benchAttachGlass(element,options); let ended=false;
 return ()=>{if(ended)return;ended=true;b.events.push({type:'release',id,time:performance.now(),connected:element.isConnected});stop()};
}
`
    );
  },
};
const config = (entry, outDir) => ({
  configFile: false,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  root: repo,
  resolve: { alias: aliases },
  plugins: [
    instrument,
    stylex({
      dev: false,
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS" },
    }),
  ],
  build: {
    outDir,
    emptyOutDir: true,
    lib: { entry, formats: ["es"], fileName: () => "index.js", cssFileName: "style" },
  },
});
await build(config(path.join(root, "react.jsx"), path.join(cache, "react")));
await Bun.write(
  path.join(cache, "react/index.html"),
  '<meta charset="utf-8"><link rel="stylesheet" href="/react/style.css"><link rel="stylesheet" href="/common.css"><div id="exact-root"></div><script type="module" src="/react/index.js"></script>',
);
const app = path.join(cache, "exact-app");
await mkdir(path.join(app, "modules/web"), { recursive: true });
const contract = path.join(app, "node_modules/@lenso/ui-exact");
await mkdir(contract, { recursive: true });
for (const entry of ["package.json", "index.contract", "components"])
  await cp(path.join(repo, "packages/ui-exact", entry), path.join(contract, entry), {
    recursive: true,
  });
const { withLensoWeb } = await import("../../packages/ui-exact/scripts/stage.ts");
await Bun.write(
  path.join(app, "app.json"),
  JSON.stringify(
    withLensoWeb({
      name: "Glass comparison",
      app: { id: "dev.lenso.glassbench", name: "Glass comparison" },
      host: { web: {} },
      data: ["bench-panel", "bench-grid"],
    }),
  ),
);
const panels = Array.from(
  { length: 8 },
  (_, i) =>
    `          Glass(testId="panel-${i}")\n            text "Panel ${i + 1}"\n            button press=increment testId="count-${i}"\n              text \`Count: \${count}\``,
).join("\n");
await Bun.write(
  path.join(app, "app.contract"),
  `use Glass, Backdrop from "@lenso/ui-exact"\ncomponent App\n  state enabled = false\n  state count = 0\n  action enable\n    enabled = true\n  action increment\n    count = count + 1\n  view\n    column\n      Backdrop()\n        view testId="background"\n      button press=enable testId="enable"\n        text "Enable glass"\n      if enabled\n        view testId="bench-grid"\n${panels}\n`,
);
await build(config(path.join(root, "exact.ts"), path.join(app, "modules/web")));
const sdk = process.env.EXACT_ROOT ?? "/tmp/lenso-exact-stock-956ae33-20261111";
const p = Bun.spawn(
  [
    "bun",
    path.join(sdk, "host/web-js/build.mjs"),
    app,
    "--out",
    path.join(cache, "exact"),
    "--render",
    "none",
  ],
  { cwd: sdk, stdout: "inherit", stderr: "inherit", env: { ...process.env, EXACT_FEEDBACK: "0" } },
);
if (await p.exited) throw Error("Exact build failed");
let html = await Bun.file(path.join(cache, "exact/index.html")).text();
html = html.replace(
  '<base href="/">',
  '<base href="/exact/"><link rel="stylesheet" href="/exact/modules/style.css"><link rel="stylesheet" href="/common.css">',
);
await Bun.write(path.join(cache, "exact/index.html"), html);
await cp(path.join(root, "common.css"), path.join(cache, "common.css"));
console.log(cache);
