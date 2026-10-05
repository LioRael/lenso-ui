// The asset-rewrite tests never rendered a custom global-error document. This
// fixture proves ordinary CSS imports survive both native bypass-layout paths.
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { connect, type AddressInfo } from "node:net";
import { chromium } from "playwright";
import stylex from "@lenso/stylex-build";

interface Asset {
  fileName: string;
  source: string;
}
interface Collector {
  buildStart(this: object): Promise<void>;
  transform(this: object, code: string, id: string): Promise<{ code: string }>;
  generateBundle(
    this: { emitFile(asset: Asset): void },
    options: object,
    bundle: object,
  ): Promise<void>;
}

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const provider = resolve(process.argv[2] ?? project);
const docsRequire = createRequire(resolve(provider, "apps/docs/package.json"));
const nextCli = docsRequire.resolve("next/dist/bin/next");
assert.equal(docsRequire("next/package.json").version, "16.3.8");
assert.equal(docsRequire("react/package.json").version, "19.3.0");
const root = resolve(project, "test-results/stylex-next-css-import");
const exec = promisify(execFile);
const environment = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" };
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
await mkdir(resolve(root, "node_modules/@lenso"), { recursive: true });
for (const name of await readdir(resolve(provider, "apps/docs/node_modules"))) {
  if (name.startsWith(".") || name === "@lenso") continue;
  await symlink(
    resolve(provider, "apps/docs/node_modules", name),
    resolve(root, "node_modules", name),
  );
}
await symlink(
  resolve(project, "packages/stylex-build"),
  resolve(root, "node_modules/@lenso/stylex-build"),
);
async function file(name: string, source: string) {
  const path = resolve(root, name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source);
  return path;
}

const producer = stylex.rolldown({
  emitMetadata: "rules.json",
  devMode: "off",
}) as unknown as Collector;
await producer.buildStart.call({});
const maps = await producer.transform.call(
  {},
  `import * as stylex from '@stylexjs/stylex';export const styles=stylex.create({
    root:{color:'rgb(12,34,56)',padding:24,opacity:0},title:{fontSize:16}
  });`,
  resolve(root, "package/maps.js"),
);
await file("package/maps.js", maps.code);
await file(
  "package/maps.d.ts",
  `import type {StyleXStyles} from '@stylexjs/stylex';
  export declare const styles:{root:StyleXStyles;title:StyleXStyles};`,
);
const packageAssets: Asset[] = [];
await producer.generateBundle.call({ emitFile: (asset) => packageAssets.push(asset) }, {}, {});
const packageMetadata = packageAssets.find((asset) => asset.fileName === "rules.json");
assert(packageMetadata);
const metadata = await file("package/rules.json", packageMetadata.source);
const application = `{
    root:{opacity:{default:0,':is([data-checked])':1}},
    padding:(value:number)=>({paddingTop:value}),
    responsive:{fontSize:{default:16,'@media (min-width:900px)':14}},
    unrelated:{margin:0}
  }`;
await file(
  "application.ts",
  `import * as stylex from '@stylexjs/stylex';export const styles=stylex.create(${application});`,
);
await file(
  "server-styles.ts",
  `import * as stylex from '@stylexjs/stylex';export const styles=stylex.create({root:{paddingBottom:37}});`,
);
await file("package.json", JSON.stringify({ name: "next-css-import-proof", private: true }));
await file(
  "next.config.ts",
  `import type {NextConfig} from 'next';
  import {prepareNext} from '@lenso/stylex-build';
  export default async function config():Promise<NextConfig>{
    const plugin=await prepareNext({
      metadata:[${JSON.stringify(metadata)}],
      sources:${JSON.stringify([resolve(root, "application.ts"), resolve(root, "server-styles.ts")])},
      cssFile:${JSON.stringify(resolve(root, "stylex.css"))}
    });
    return {experimental:{cpus:1,globalNotFound:true},
      webpack(config){config.cache=false;config.plugins.push(plugin);return config;}};
  }`,
);
await file(
  "probe.tsx",
  `import * as stylex from '@stylexjs/stylex';
  import {styles as pkg} from './package/maps';
  import {styles as app} from './application';
  export default function Probe({value=29}:{value?:number}){
    return <div id="probe" data-checked="" {...stylex.props(pkg.root,pkg.title,app.root,app.padding(value),app.responsive)}>Probe</div>;
  }`,
);
await file(
  "app/(one)/layout.tsx",
  `import '../../stylex.css';
  import {headers} from 'next/headers';
  export default async function Layout({children}:{children:React.ReactNode}){
    if((await headers()).get('x-root-crash')) throw new Error('Intentional server root layout failure');
    return <html data-owner="one"><body>{children}</body></html>;
  }`,
);
await file(
  "app/(one)/page.tsx",
  `import * as stylex from '@stylexjs/stylex';
  import {styles} from '../../server-styles';
  import Probe from '../../probe';
  export default function Page(){return <div id="server-only" {...stylex.props(styles.root)}><Probe/></div>;}`,
);
await file(
  "app/(two)/layout.tsx",
  `'use client';
  import '../../stylex.css';
  import {useState} from 'react';
  export default function Layout({children}:{children:React.ReactNode}){
    const [crashed,setCrashed]=useState(false);
    if(crashed) throw new Error('Intentional root layout failure');
    return <html data-owner="two"><body><button id="crash" onClick={()=>setCrashed(true)}>Crash layout</button>{children}</body></html>;
  }`,
);
await file(
  "app/(two)/client/page.tsx",
  `'use client';
  import {useState} from 'react';
  import Probe from '../../../probe';
  export default function Page(){
    const [value,setValue]=useState(29);
    return <><button id="dynamic" onClick={()=>setValue(41)}>Change padding</button><Probe value={value}/></>;
  }`,
);
await file(
  "app/global-error.tsx",
  `'use client';
  import '../stylex.css';
  import Probe from '../probe';
  export default function GlobalError(){
    return <html data-owner="global-error"><body><Probe/></body></html>;
  }`,
);
await file(
  "app/global-not-found.tsx",
  `import '../stylex.css';
  import Probe from '../probe';
  export default function NotFound(){
    return <html data-owner="global-not-found"><body><Probe/></body></html>;
  }`,
);
const build = await exec(process.execPath, [nextCli, "build", "--webpack"], {
  cwd: root,
  env: environment,
  timeout: 120_000,
  maxBuffer: 8 * 1024 * 1024,
});
await file("build.log", build.stdout + build.stderr);
const builtCSS = await readFile(resolve(root, "stylex.css"), "utf8");

const portProbe = createServer();
await new Promise<void>((done) => portProbe.listen(0, "127.0.0.1", done));
const port = (portProbe.address() as AddressInfo).port;
await new Promise<void>((done, reject) =>
  portProbe.close((error) => (error ? reject(error) : done())),
);
const server = spawn(process.execPath, [nextCli, "start", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: root,
  env: environment,
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (chunk: Buffer) => (serverLog += chunk));
server.stderr.on("data", (chunk: Buffer) => (serverLog += chunk));
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
const results: object[] = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(server.exitCode, null, serverLog);
    try {
      await new Promise<void>((done, reject) => {
        const socket = connect(port, "127.0.0.1");
        socket.once("connect", () => {
          socket.destroy();
          done();
        });
        socket.once("error", reject);
        socket.setTimeout(1000, () =>
          socket.destroy(Object.assign(new Error("TCP readiness timeout"), { code: "ETIMEDOUT" })),
        );
      });
      ready = true;
      break;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        !["ECONNREFUSED", "ETIMEDOUT"].includes(String(error.code))
      )
        throw error;
    }
    await new Promise((done) => setTimeout(done, 100));
  }
  assert(ready, serverLog);
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  async function verify(owner: string, padding = "29px") {
    await page.locator(`html[data-owner="${owner}"] #probe`).waitFor();
    const actual = await page.locator("#probe").evaluate((node) => {
      const css = getComputedStyle(node);
      return {
        color: css.color,
        opacity: css.opacity,
        paddingTop: css.paddingTop,
        paddingLeft: css.paddingLeft,
        fontSize: css.fontSize,
        dynamic: [...(node as HTMLElement).style].filter((name) => name.startsWith("--")).length,
      };
    });
    assert.deepEqual(actual, {
      color: "rgb(12, 34, 56)",
      opacity: "1",
      paddingTop: padding,
      paddingLeft: "24px",
      fontSize: "14px",
      dynamic: 1,
    });
    const sheets = await page.evaluate(() => [...document.styleSheets].map((sheet) => sheet.href));
    assert.equal(sheets.length, 1, "Each document loads one ordinary CSS dependency");
    assert(sheets[0]?.startsWith(origin + "/_next/static/css/"));
    results.push({ owner, actual, sheets });
  }
  // TCP readiness sends no HTTP request. The first server request and browser
  // document fail in the root layout, with no prior successful render or CSS.
  await page.setExtraHTTPHeaders({ "x-root-crash": "1" });
  const failed = await page.goto(origin);
  assert.equal(failed?.status(), 500);
  await verify("global-error");
  assert.equal(await page.locator("#server-only").count(), 0);
  await page.setExtraHTTPHeaders({});
  await page.goto(origin);
  await verify("one");
  assert.equal(
    await page.locator("#server-only").evaluate((node) => getComputedStyle(node).paddingBottom),
    "37px",
    "Source declarations absent from the client graph are still delivered",
  );
  await page.setViewportSize({ width: 500, height: 600 });
  assert.equal(
    await page.locator("#probe").evaluate((node) => getComputedStyle(node).fontSize),
    "16px",
  );
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto(origin + "/client");
  await verify("two");
  await page.locator("#dynamic").click();
  await verify("two", "41px");
  await page.locator("#crash").click();
  await verify("global-error");
  assert.equal(await page.locator("#crash").count(), 0, "The failing root layout is bypassed");
  const missing = await page.goto(origin + "/missing");
  assert.equal(missing?.status(), 404);
  await verify("global-not-found");
  await page.close();
  await file(
    "evidence.json",
    JSON.stringify({ next: "16.3.8", api: "prepareNext", results }, null, 2),
  );
  console.log(`Next ordinary CSS import production proof passed: ${root}/evidence.json`);
} finally {
  await browser.close();
  if (server.exitCode === null) {
    const stopped = new Promise((done) => server.once("exit", done));
    server.kill("SIGTERM");
    const timeout = setTimeout(() => server.kill("SIGKILL"), 5000);
    await stopped;
    clearTimeout(timeout);
  }
  await file("server.log", serverLog);
  assert.equal(await readFile(resolve(root, "stylex.css"), "utf8"), builtCSS);
}
