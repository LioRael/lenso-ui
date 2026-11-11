import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";
export async function destinations(gen, input) {
  const require = createRequire(path.join(import.meta.dirname, "../../../../package.json"));
  const happy = createRequire(require.resolve("@happy-dom/global-registrator"));
  const { Window } = await import(happy.resolve("happy-dom"));
  const window = new Window();
  const app = await Bun.file(path.join(gen, "typescript/app.ts")).text();
  const pairs = [
    ...app.matchAll(/\["([^"]+)", \(\) => import\("\.\/docs-content\/(body-\d+\.ts)"\)/g),
  ];
  assert.ok(pairs.length > 0, "Expected static document projection sources");
  const loads = [];
  for (const [, url, body] of pairs) {
    const html = await Bun.file(path.join(input, url.slice(1), "index.html")).text();
    const doc = new window.DOMParser().parseFromString(html, "text/html");
    const root = doc.getElementById("exact-root");
    assert.ok(root);
    const head = {};
    for (const sel of ['meta[name="description"]', 'link[rel="canonical"]', 'meta[name="robots"]'])
      head[sel] = doc.head.querySelector(sel)?.outerHTML ?? null;
    const projection = {
      html: root.outerHTML,
      title: doc.title,
      lang: doc.documentElement.lang,
      dir: doc.documentElement.dir,
      head,
    };
    const file = path.join(gen, "typescript/docs-content", body);
    await Bun.write(
      file,
      (await Bun.file(file).text()) +
        "\nexport const docsProjection=" +
        JSON.stringify(projection) +
        ";\n",
    );
    loads.push(
      `[${JSON.stringify(url)},()=>import('./typescript/docs-content/${body}').then(module=>module.docsProjection)]`,
    );
  }
  await Bun.write(
    path.join(gen, "destination-loads.js"),
    `export const loads=new Map([${loads.join(",")}]);`,
  );
  await window.happyDOM.close();
}
