import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { localizeModule, generateLocalizedExamples } from "./localize-live-examples.mjs";

test("paired escaped strings and templates translate without changing CSS, imports, or identifiers", () => {
  const en =
    'import stylex from "@stylexjs/stylex"; import {Label} from "Label"; const css = stylex.create({root:{content:"Label"}}); const LabelData = "Say \\"hello\\""; export function Basic(){return <Label aria-label="Label" placeholder={"Say \\"hello\\""}>{`Hello ${LabelData}!`}</Label>}';
  const cn = en
    .replace('const LabelData = "Say \\"hello\\""', 'const LabelData = "说\\"你好\\""')
    .replace('aria-label="Label"', 'aria-label="标签"')
    .replace('placeholder={"Say \\"hello\\""}', 'placeholder={"说\\"你好\\""}')
    .replace("`Hello ${LabelData}!`", "`你好 ${LabelData}！`");
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /aria-label="标签"/);
  assert.match(result.code, /你好 \$\{LabelData\}！/);
  assert.match(result.code, /content: "Label"/);
  assert.match(result.code, /from "Label"/);
  assert.equal(result.unresolved.length, 0);
});

test("context disambiguates data properties and accessible attributes", () => {
  const en =
    'const item={label:"Open"}; export function Basic(){return <button aria-label="Open">Open</button>}';
  const cn =
    'const item={label:"开启"}; export function Basic(){return <button aria-label="打开按钮">打开</button>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /label: "开启"/);
  assert.match(result.code, /aria-label="打开按钮"/);
  assert.match(result.code, />打开<\/button>/);
});

test("presentation roles can move into adapted helpers without translating control keys", () => {
  const en = "export const Basic=()=> <span>California</span>";
  const cn = "export const Basic=()=> <span>加利福尼亚</span>";
  const adapted =
    'const choice={value:"California",label:"California"};export const Basic=()=> <Select name="California" label="California" value={choice.value}/>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /value: "California"/);
  assert.match(result.code, /name="California"/);
  assert.match(result.code, /label: "加利福尼亚"/);
  assert.match(result.code, /label="加利福尼亚"/);
});

test("toast content nested inside an event callback keeps its own presentation context", () => {
  const en =
    'export const Basic=()=> <button onPress={()=>add({title:"Invitation",action:<button>Dismiss</button>})}>Show</button>';
  const cn =
    'export const Basic=()=> <button onPress={()=>add({title:"邀请",action:<button>忽略</button>})}>显示</button>';
  const adapted =
    'const message={title:"Invitation"};export const Basic=()=> <Toast><button>Dismiss</button></Toast>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /title: "邀请"/);
  assert.match(result.code, />忽略<\/button>/);
});

test("repeated ambiguous words in changed compositions are reported, not guessed", () => {
  const en = "export function Basic(){return <><button>Open</button><button>Open</button></>}";
  const cn = "export function Basic(){return <><button>开启</button><button>打开</button></>}";
  const adapted = "export function Basic(){return <section><button>Open</button></section>}";
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, />Open<\/button>/);
  assert.equal(result.ambiguities.length, 1);
  assert.equal(result.unresolved.length, 2);
});

test("missing adapted literals and source behavioral differences remain explicit", () => {
  const result = localizeModule(
    "export const Basic=()=> <button onClick={()=>run(1)}>Hello</button>",
    "export const Basic=()=> <button onClick={()=>run(2)}>你好</button>",
    "export const Basic=()=> <button>Other</button>",
  );
  assert.equal(result.structuralDifference, true);
  assert.equal(result.unresolved[0].from, "Hello");
});

test("pinned CN presentation dictionaries localize displayed enums without changing control values", () => {
  const en =
    'export function Colors(){const color="warning";return <Meter color={color}><Label>{color}</Label><Label>Warning</Label></Meter>}';
  const cn =
    'const COLOR_LABELS:Record<string,string>={warning:"警告"};export function Colors(){const color="warning";return <Meter color={color}><Label>{COLOR_LABELS[color]}</Label><Label>警告</Label></Meter>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /color = "warning"/);
  assert.match(result.code, /color=\{color\}/);
  assert.match(result.code, /\{COLOR_LABELS\[color\]\}/);
  assert.match(result.code, />警告<\/Label>/);
  assert.equal(result.presentationMaps[0].applied, 1);
});

test("presentation map collisions are reported rather than overwriting adapted identifiers", () => {
  const en = "export const Basic=()=> <span>{size}</span>";
  const cn = 'const SIZES={sm:"小"};export const Basic=()=> <span>{SIZES[size]}</span>';
  const adapted = 'const SIZES={sm:"Custom"};export const Basic=()=> <span>{size}</span>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /\{size\}/);
  assert.equal(result.presentationAmbiguities[0].reason, "adapted-identifier-collision");
});

test("CN-only uniform accessible attributes are copied from source without replacing dynamic names", () => {
  const en = 'export const Basic=()=> <Avatar.Image src="avatar.jpg"/>';
  const cn = 'export const Basic=()=> <Avatar.Image alt="头像" src="avatar.jpg"/>';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /alt="头像"/);
  assert.match(result.code, /src="avatar.jpg"/);
  const dynamic = localizeModule(
    en,
    cn,
    'export const Basic=()=> <Avatar.Image alt={user.name} src="avatar.jpg"/>',
  );
  assert.match(dynamic.code, /alt=\{user.name\}/);
  assert.equal(dynamic.addedAccessibleAttributes[0].blockedExpressions, 1);
});

test("new helpers and export placement cannot shift source literal alignment", () => {
  const en = "export function Basic(){return <button>Open</button>}";
  const cn =
    'function helper(){return "unused"}; export function Basic(){return <button>打开</button>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, />打开<\/button>/);
  assert.equal(result.translations[0].from, "Open");
});

test("translated quoted JSX attributes remain parseable and retain their accessible text", () => {
  const en = 'export const Basic=()=> <input aria-label="Say &quot;hello&quot;"/>';
  const cn = 'export const Basic=()=> <input aria-label="说&quot;你好&quot;"/>';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /aria-label=\{/);
  assert.doesNotThrow(() => localizeModule(result.code, result.code, result.code));
});

test("aliases deduplicate generated modules; absent CN helpers point to adapted EN helpers", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-localize-"));
  await mkdir(path.join(directory, "content/examples/en"), { recursive: true });
  await mkdir(path.join(directory, "content/examples/cn"), { recursive: true });
  await mkdir(path.join(directory, "src/demos/en/button"), { recursive: true });
  const en =
    'import {helper} from "./helper"; const load=()=>import("./helper"); export const Basic=()=> <button>Hello</button>';
  const cn = en.replace("Hello", "你好");
  await writeFile(
    path.join(directory, "content/examples/en/basic.json"),
    JSON.stringify({ code: en }),
  );
  await writeFile(
    path.join(directory, "content/examples/cn/basic.json"),
    JSON.stringify({ code: cn }),
  );
  const record = {
    file: "content/examples/en/basic.json",
    source: "apps/docs/src/demos/en/button/basic.tsx",
  };
  const counterpart = {
    file: "content/examples/cn/basic.json",
    source: "apps/docs/src/demos/cn/button/basic.tsx",
  };
  await writeFile(
    path.join(directory, "content/source-index.json"),
    JSON.stringify({
      examples: {
        en: { basic: record, alias: record },
        cn: { basic: counterpart, alias: counterpart },
      },
    }),
  );
  await writeFile(path.join(directory, "src/demos/en/button/basic.tsx"), en);
  const manifest = await generateLocalizedExamples(directory);
  assert.equal(manifest.cn.basic, manifest.cn.alias);
  const code = await readFile(path.join(directory, "src/demos/cn/button/basic.tsx"), "utf8");
  assert.match(code, /from "\.\.\/\.\.\/en\/button\/helper"/);
  assert.match(code, /import\("\.\.\/\.\.\/en\/button\/helper"\)/);
  assert.match(code, />你好<\/button>/);
  const provenance = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  );
  assert.equal(Object.keys(provenance.modules).length, 1);
  await writeFile(
    path.join(directory, "src/demos/en/button/helper.tsx"),
    "export function Helper(){return <button>Hello</button>}",
  );
  await writeFile(
    path.join(directory, "src/demos/en/button/basic.tsx"),
    'import {Helper} from "./helper";export function Basic(){return <Helper/>}',
  );
  const helperManifest = await generateLocalizedExamples(directory);
  assert.equal(helperManifest.cn.basic, "cn/button/basic.tsx");
  const helperCode = await readFile(
    path.join(directory, "src/demos/cn/button/basic--helper.tsx"),
    "utf8",
  );
  assert.match(helperCode, />你好<\/button>/);
  const wrapperCode = await readFile(path.join(directory, "src/demos/cn/button/basic.tsx"), "utf8");
  assert.match(wrapperCode, /from "\.\/basic--helper"/);
  await writeFile(
    path.join(directory, "src/demos/en/button/basic.tsx"),
    'export {Helper as Basic} from "./helper"',
  );
  await generateLocalizedExamples(directory);
  const reexportCode = await readFile(
    path.join(directory, "src/demos/cn/button/basic.tsx"),
    "utf8",
  );
  assert.match(reexportCode, />你好<\/button>/);
  assert.match(reexportCode, /export \{ Helper as Basic \}/);
});
