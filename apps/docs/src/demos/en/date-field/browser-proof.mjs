// HeroUI v3.2.6 examples. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, writeFile, cp, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The supplied checkout is read-only: all generated consumers and output live in scratch.
const parent = path.resolve(process.argv[2] ?? ".");
const here = path.dirname(fileURLToPath(import.meta.url));
const root = await mkdtemp(
  path.join(process.env["DELTA_SCRATCH_DIR"] ?? tmpdir(), "date-time-proof-"),
);
const { build, preview } = await import(
  `${parent}/packages/testing/node_modules/vite/dist/node/index.js`
);
const { default: stylex } = await import(
  `${parent}/node_modules/@stylexjs/unplugin/lib/es/vite.mjs`
);
const { chromium } = await import(`${parent}/packages/testing/node_modules/playwright/index.mjs`);
await mkdir(`${root}/demos`);
await cp(here, `${root}/demos/date-field`, { recursive: true });
await cp(path.join(here, "../time-field"), `${root}/demos/time-field`, { recursive: true });
await symlink(`${parent}/apps/docs/node_modules`, `${root}/node_modules`);
const imports = [];
const demos = [];
const ids = [];
for (const family of ["date-field", "time-field"]) {
  for (const file of (await readdir(`${root}/demos/${family}`)).filter((file) =>
    file.endsWith(".tsx"),
  )) {
    const code = await readFile(`${root}/demos/${family}/${file}`, "utf8");
    const name = code.match(/export function (\w+)/)?.[1];
    assert.ok(name, `Missing scenario export: ${family}/${file}`);
    const alias = `Demo${demos.length}`;
    const id = `${family}/${file.replace(".tsx", "")}`;
    ids.push(id);
    imports.push(`import {${name} as ${alias}} from './demos/${family}/${file}';`);
    demos.push(`[${JSON.stringify(id)},${alias}]`);
  }
}
assert.equal(ids.length, 32);
await writeFile(
  `${root}/index.html`,
  '<div id="root"></div><script type="module" src="/main.tsx"></script>',
);
await writeFile(
  `${root}/main.tsx`,
  `import {createRoot} from 'react-dom/client';
import {DateField,TimeField} from '@lenso/ui';
import {I18nProvider} from 'react-aria-components/I18nProvider';
import {parseDate,Time} from '@internationalized/date';
import '${parent}/packages/styles/dist/styles.css';
${imports.join("\n")}
const demos=[${demos.join(",")}];
createRoot(document.getElementById('root')).render(<main>
{demos.map(([id,Demo])=><section key={id} data-demo={id}><h2>{id}</h2><Demo/></section>)}
<I18nProvider locale="en-GB">
<section data-fixture="gb"><DateField defaultValue={parseDate('2025-02-03')}><DateField.Label>British date</DateField.Label><DateField.Group><DateField.Input>{s=><DateField.Segment segment={s}/>}</DateField.Input></DateField.Group></DateField></section>
<section data-fixture="readonly"><DateField isReadOnly defaultValue={parseDate('2025-02-03')}><DateField.Label>Readonly date</DateField.Label><DateField.Group><DateField.Input>{s=><DateField.Segment segment={s}/>}</DateField.Input></DateField.Group></DateField></section>
<section data-fixture="time24"><TimeField defaultValue={new Time(13,30)} hourCycle={24}><TimeField.Label>24h time</TimeField.Label><TimeField.Group><TimeField.Input>{s=><TimeField.Segment segment={s}/>}</TimeField.Input></TimeField.Group></TimeField></section>
<section data-fixture="time-readonly"><TimeField isReadOnly defaultValue={new Time(13,30)}><TimeField.Label>Readonly time</TimeField.Label><TimeField.Group><TimeField.Input>{s=><TimeField.Segment segment={s}/>}</TimeField.Input></TimeField.Group></TimeField></section>
</I18nProvider></main>);`,
);
const config = {
  root,
  configFile: false,
  plugins: [stylex({ dev: false, useCSSLayers: false, lightningcssOptions: { exclude: 4 } })],
  esbuild: { jsx: "automatic" },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: "@lenso/ui", replacement: `${parent}/packages/react/dist/index.js` },
      {
        find: "@internationalized/date",
        replacement: `${parent}/packages/react/node_modules/@internationalized/date`,
      },
      {
        find: /^react-aria-components\/(.*)$/,
        replacement: `${parent}/packages/react/node_modules/react-aria-components/$1`,
      },
      { find: "react", replacement: `${parent}/apps/docs/node_modules/react` },
      { find: "react-dom", replacement: `${parent}/apps/docs/node_modules/react-dom` },
    ],
  },
  build: { outDir: `${root}/dist`, emptyOutDir: true },
};
await build(config);
const server = await preview({ ...config, preview: { port: 0, host: "127.0.0.1" } });
const browser = await chromium.launch();
const report = { inventory: ids, modes: [], assertions: [], clientErrors: [] };
try {
  for (const mode of [
    { theme: "light", width: 1440, direction: "ltr", reducedMotion: "no-preference" },
    { theme: "dark", width: 390, direction: "rtl", reducedMotion: "reduce" },
  ]) {
    const page = await browser.newPage({
      viewport: { width: mode.width, height: 900 },
      reducedMotion: mode.reducedMotion,
      locale: "en-US",
    });
    page.on("pageerror", (error) => report.clientErrors.push(String(error)));
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
    await page.evaluate(({ theme, direction }) => {
      document.documentElement.className = theme;
      document.documentElement.dir = direction;
      document.body.style.margin = "0";
    }, mode);
    const region = (id) => page.locator(`[data-demo="${id}"]`);
    for (const id of ids) {
      await region(id).getByRole("spinbutton").first().waitFor();
      const box = await region(id).boundingBox();
      assert.ok(box?.width > 0 && box.height > 0, id);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    report.modes.push({ ...mode, mounts: ids.length });
    for (const family of ["date-field", "time-field"]) {
      const controlled = region(`${family}/controlled`);
      await controlled
        .getByRole("button", { name: family === "date-field" ? "Set today" : "Set now" })
        .click();
      assert.ok(!(await controlled.textContent()).includes("(empty)"));
      const target = controlled.getByRole("spinbutton", {
        name: family === "date-field" ? /day,/ : /minute,/,
      });
      const before = await target.getAttribute("aria-valuenow");
      await target.focus();
      await target.press("ArrowUp");
      assert.notEqual(await target.getAttribute("aria-valuenow"), before);
      await controlled.getByRole("button", { name: "Clear", exact: true }).click();
      assert.ok((await controlled.textContent()).includes("(empty)"));
      assert.equal(
        await region(`${family}/disabled`).locator('[role=spinbutton][tabindex="0"]').count(),
        0,
      );
      assert.ok(
        (await region(`${family}/invalid`).locator('[data-slot="field-error"]').count()) > 0,
      );
    }
    const granularity = region("date-field/granularity");
    for (const unit of ["Hour", "Minute", "Second", "Day"]) {
      await granularity.getByRole("combobox").click();
      await page.getByRole("option", { name: unit, exact: true }).click();
      if (unit !== "Day") assert.ok((await granularity.textContent()).includes("PST"));
      assert.equal(
        await granularity.getByRole("spinbutton", { name: /second,/ }).count(),
        unit === "Second" ? 1 : 0,
      );
    }
    for (const [id, segments, message] of [
      [
        "date-field/with-validation",
        [
          [/month,/, "1"],
          [/day,/, "1"],
          [/year,/, "2000"],
        ],
        "Date must be today",
      ],
      [
        "time-field/with-validation",
        [
          [/hour,/, "6"],
          [/minute,/, "00"],
          [/AM\/PM,/, "a"],
        ],
        "Time must be between",
      ],
    ]) {
      for (const [name, keys] of segments) {
        const segment = region(id).getByRole("spinbutton", { name });
        await segment.focus();
        await segment.press("ControlOrMeta+A");
        await segment.pressSequentially(keys);
      }
      await page.getByRole("heading", { name: id, exact: true }).click();
      assert.ok((await region(id).textContent()).includes(message));
    }
    for (const [id, segments] of [
      [
        "date-field/form-example",
        [
          [/month,/, "1"],
          [/day,/, "1"],
          [/year,/, "2099"],
        ],
      ],
      [
        "time-field/form-example",
        [
          [/hour,/, "10"],
          [/minute,/, "00"],
          [/AM\/PM,/, "a"],
        ],
      ],
    ]) {
      const form = region(id);
      assert.ok(await form.getByRole("button", { name: "Submit", exact: true }).isDisabled());
      for (const [name, keys] of segments) {
        const segment = form.getByRole("spinbutton", { name });
        await segment.focus();
        await segment.press("ControlOrMeta+A");
        await segment.pressSequentially(keys);
      }
      await form.getByRole("button", { name: "Submit", exact: true }).click();
      await form.getByRole("button", { name: "Submitting..." }).waitFor();
      await form.getByRole("button", { name: "Submit", exact: true }).waitFor();
      assert.ok(await form.getByRole("button", { name: "Submit", exact: true }).isDisabled());
      assert.equal(
        await form.getByRole("spinbutton", { name: /minute,|year,/ }).getAttribute("aria-valuenow"),
        null,
      );
    }
    for (const slot of ["label", "group", "input"]) {
      assert.equal(
        await region("date-field/render-function")
          .locator(`[data-custom="date-field-${slot}"]`)
          .count(),
        1,
      );
    }
    assert.equal(
      await region("time-field/render-function").locator('[data-custom="foo"]').count(),
      1,
    );
    const order = await page
      .locator('[data-fixture="gb"]')
      .getByRole("spinbutton")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-label")));
    assert.ok(order[0].startsWith("day"));
    for (const [fixture, name, expected] of [
      ["readonly", /day,/, "3"],
      ["time-readonly", /minute,/, "30"],
    ]) {
      const segment = page.locator(`[data-fixture="${fixture}"]`).getByRole("spinbutton", { name });
      await segment.focus();
      await segment.press("ArrowUp");
      assert.equal(await segment.getAttribute("aria-valuenow"), expected);
    }
    const time24 = page.locator('[data-fixture="time24"]');
    assert.equal(
      await time24.getByRole("spinbutton", { name: /hour,/ }).getAttribute("aria-valuenow"),
      "13",
    );
    assert.equal(await time24.getByRole("spinbutton", { name: /AM\/PM,/ }).count(), 0);
    report.assertions.push(
      `${mode.theme}: controlled keyboard, clear, disabled, invalid, granularity/PST, validation, form submission/reset, render composition, en-GB order, readonly date/time, 24h`,
    );
    await page.close();
  }
  assert.deepEqual(report.clientErrors, []);
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
  await writeFile(`${root}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Date/time source proof: ${root}/report.json`);
}
