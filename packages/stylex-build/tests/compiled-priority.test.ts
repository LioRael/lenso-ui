import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import * as runtime from "@stylexjs/stylex";
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
type Styles = Record<string, runtime.StyleXStyles> & {
  padding: (value: number) => runtime.StyleXStyles;
};
async function compile(plugin: Collector, body: string, id: string) {
  const result = await plugin.transform.call(
    {},
    `import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create(${body});`,
    id,
  );
  const assets: Asset[] = [];
  await plugin.generateBundle.call({ emitFile: (asset) => assets.push(asset) }, {}, {});
  const evaluate = new Function(
    "stylex",
    result.code.replace(/^import .*;$/gm, "").replace("export const styles", "const styles") +
      "\nreturn styles;",
  );
  return { assets, styles: evaluate(runtime) as Styles };
}

// Independently guarded package CSS changed conditional priority when another bundle
// introduced an unrelated bucket. Node collector tests alone do not prove the cascade.
test("one-pass package/consumer CSS retains conditional, pseudo, dynamic and directional priority", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-priority-"));
  const browser = await chromium.launch();
  try {
    const producer = stylex.rolldown({
      emitMetadata: "rules.json",
      devMode: "off",
    }) as unknown as Collector;
    await producer.buildStart.call({});
    const packageStyles = await compile(
      producer,
      `{
      popup: {padding: 24, opacity: 0},
      radio: {"::before": {content: '""', scale: {default: "0", ":is([data-checked])": "1"}}},
      title: {fontSize: 16}
    }`,
      "/package.stylex.ts",
    );
    const metadata = packageStyles.assets.find((asset) => asset.fileName === "rules.json");
    assert(metadata);
    const file = join(directory, "rules.json");
    await writeFile(file, metadata.source);
    const consumer = stylex.rolldown({
      metadata: [file],
      devMode: "off",
      lightningcssOptions: { exclude: 4 },
    }) as unknown as Collector;
    await consumer.buildStart.call({});
    const app = await compile(
      consumer,
      `{
      check: {opacity: {default: 0, ":is([data-checked])": 1}},
      radio: {"::before": {scale: {default: "1", ":is([data-checked])": ".5"}}},
      padding: (value) => ({paddingTop: value}),
      logical: {paddingInlineStart: 37, paddingInlineEnd: 11},
      physical: {paddingLeft: 17, paddingRight: 23},
      responsive: {fontSize: {default: 16, "@media (min-width: 900px)": 14}},
      unrelated: {margin: 0}
    }`,
      "/consumer.stylex.ts",
    );
    const css = app.assets.find((asset) => asset.fileName === "assets/stylex.css");
    assert(css);
    const baseline =
      packageStyles.assets.find((asset) => asset.fileName === "assets/stylex.css")?.source ?? "";
    const fixtures = [
      { id: "check", props: runtime.props(packageStyles.styles["popup"], app.styles["check"]) },
      { id: "radio", props: runtime.props(packageStyles.styles["radio"], app.styles["radio"]) },
      {
        id: "padding",
        props: runtime.props(packageStyles.styles["popup"], app.styles.padding(29)),
      },
      {
        id: "responsive",
        props: runtime.props(packageStyles.styles["title"], app.styles["responsive"]),
      },
      ...(["ltr", "rtl"] as const).flatMap((dir) => [
        {
          id: `${dir}-logical`,
          dir,
          props: runtime.props(packageStyles.styles["popup"], app.styles["logical"]),
        },
        {
          id: `${dir}-physical`,
          dir,
          props: runtime.props(packageStyles.styles["popup"], app.styles["physical"]),
        },
        {
          id: `${dir}-logical-last`,
          dir,
          props: runtime.props(
            packageStyles.styles["popup"],
            app.styles["physical"],
            app.styles["logical"],
          ),
        },
        {
          id: `${dir}-physical-last`,
          dir,
          props: runtime.props(
            packageStyles.styles["popup"],
            app.styles["logical"],
            app.styles["physical"],
          ),
        },
      ]),
    ];
    for (const order of [
      [baseline, css.source],
      [css.source, baseline],
    ]) {
      const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
      await page.setContent(`<style>${order[0]}</style><style>${order[1]}</style>`);
      await page.evaluate((items) => {
        for (const item of items) {
          const node = document.createElement("div");
          node.id = item.id;
          node.className = item.props.className ?? "";
          if ("dir" in item) node.dir = item.dir;
          for (const [name, value] of Object.entries(item.props.style ?? {}))
            node.style.setProperty(name, String(value));
          document.body.append(node);
        }
      }, fixtures);
      assert.equal(
        await page.locator("#check").evaluate((node) => getComputedStyle(node).opacity),
        "0",
      );
      await page.locator("#check").evaluate((node) => node.setAttribute("data-checked", ""));
      assert.equal(
        await page.locator("#check").evaluate((node) => getComputedStyle(node).opacity),
        "1",
      );
      assert.equal(
        await page.locator("#radio").evaluate((node) => getComputedStyle(node, "::before").scale),
        "1",
      );
      await page.locator("#radio").evaluate((node) => node.setAttribute("data-checked", ""));
      assert.equal(
        await page.locator("#radio").evaluate((node) => getComputedStyle(node, "::before").scale),
        "0.5",
      );
      assert.equal(
        await page.locator("#padding").evaluate((node) => getComputedStyle(node).paddingTop),
        "29px",
      );
      assert.equal(
        await page.locator("#responsive").evaluate((node) => getComputedStyle(node).fontSize),
        "14px",
      );
      await page.setViewportSize({ width: 500, height: 600 });
      assert.equal(
        await page.locator("#responsive").evaluate((node) => getComputedStyle(node).fontSize),
        "16px",
      );
      for (const dir of ["ltr", "rtl"]) {
        for (const kind of ["logical", "physical", "logical-last", "physical-last"]) {
          const actual = await page.locator(`#${dir}-${kind}`).evaluate((node) => {
            const css = getComputedStyle(node);
            return [css.paddingLeft, css.paddingRight];
          });
          assert.deepEqual(
            actual,
            kind === "logical"
              ? dir === "ltr"
                ? ["37px", "11px"]
                : ["11px", "37px"]
              : ["17px", "23px"],
          );
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await rm(directory, { recursive: true, force: true });
  }
});
