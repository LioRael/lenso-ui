import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import type { PresentationRule } from "../dist/presentation.js";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import requirements from "../manifest.json" with { type: "json" };

export const webRequirements = requirements;

export interface ExactWebManifest extends Record<string, unknown> {
  data: string[];
  hatches: Record<string, unknown> & { "lenso-ui": string[] };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

/** Return the required declarations without changing the caller's manifest. */
export function withLensoWeb(manifest: unknown): ExactWebManifest {
  if (!record(manifest)) throw new TypeError("Exact app.json must be an object");
  const data = manifest["data"] === undefined ? [] : manifest["data"];
  const hatches = manifest["hatches"] === undefined ? {} : manifest["hatches"];
  if (!strings(data)) throw new TypeError("Exact app.json data must be an array of words");
  if (!record(hatches)) throw new TypeError("Exact app.json hatches must be an object");
  const platforms = hatches["lenso-ui"] === undefined ? [] : hatches["lenso-ui"];
  if (!strings(platforms)) throw new TypeError("Exact lenso-ui hatch must list its platforms");
  return {
    ...manifest,
    data: [...new Set([...data, ...requirements.data])],
    hatches: { ...hatches, "lenso-ui": [...new Set([...platforms, "web"])] },
  };
}

/** Stage built browser assets without replacing the application's page module or manifest. */
export async function stageWeb(appDirectory: string) {
  const destination = path.resolve(appDirectory, "modules/web/lenso-ui");
  await mkdir(destination, { recursive: true });
  await cp(path.resolve(import.meta.dirname, "../dist"), destination, { recursive: true });
  return destination;
}

/** Add blocking CSS to generated Exact pages, after their base URL declaration. */
export async function linkWebStyles(buildDirectory: string) {
  const root = path.resolve(buildDirectory);
  const css = Bun.file(path.join(root, "modules/lenso-ui/web.css"));
  const hash = createHash("sha256")
    .update(new Uint8Array(await css.arrayBuffer()))
    .digest("hex");
  const href = `./modules/lenso-ui/web.css?v=${hash}`;
  const tag = `<link rel="stylesheet" href="${href}" data-lenso-exact-styles>\n`;
  const changes: Array<{ file: string; html: string }> = [];
  let pages = 0;
  for (const file of new Bun.Glob("**/*.html").scanSync(root)) {
    const location = path.join(root, file);
    const original = await Bun.file(location).text();
    let base = false;
    let generated = false;
    let baseBeforeRoot = false;
    const links: Array<{ href: string | null; beforeRoot: boolean; afterBase: boolean }> = [];
    await new HTMLRewriter()
      .on("base", {
        element() {
          base = true;
        },
      })
      .on("#exact-root", {
        element() {
          generated = true;
          baseBeforeRoot = base;
        },
      })
      .on("link[data-lenso-exact-styles]", {
        element(link) {
          links.push({ href: link.getAttribute("href"), beforeRoot: !generated, afterBase: base });
        },
      })
      .transform(new Response(original))
      .text();
    if (!generated) continue;
    pages++;
    if (!baseBeforeRoot) throw new Error(`Exact page has no early base URL: ${file}`);
    if (links.length === 1 && links[0]?.href === href && links[0].beforeRoot && links[0].afterBase)
      continue;
    let inserted = false;
    const html = await new HTMLRewriter()
      .on("base", {
        element(base) {
          if (inserted) return;
          base.after(`\n${tag}`, { html: true });
          inserted = true;
        },
      })
      .on("link[data-lenso-exact-styles]", {
        element(link) {
          link.remove();
        },
      })
      .transform(new Response(original))
      .text();
    changes.push({ file: location, html });
  }
  if (!pages) throw new Error("No generated Exact HTML pages found for initial styles");
  for (const { file, html } of changes) await Bun.write(file, html);
  return changes.map(({ file }) => file);
}

/** Replace staged CSS with rules composed from the staged package's own maps. */
export async function styleWeb(
  directory: string,
  options: { css: string; rules: readonly PresentationRule[] },
) {
  const root = path.resolve(directory);
  const entry = await Bun.file(path.join(root, "presentation.js")).text();
  const version = createHash("sha256").update(entry).digest("hex");
  const url = pathToFileURL(path.join(root, "presentation.js"));
  url.searchParams.set("v", version);
  const compiled: {
    presentationCases(
      rules: readonly PresentationRule[],
    ): import("./initial-css.js").PresentationCase[];
  } = await import(url.href);
  const cases = compiled.presentationCases(options.rules);
  const { initialCSS } = await import("./initial-css.js");
  const atomic = await Bun.file(path.join(root, "web.atomic.css")).text();
  const { default: postcss } = await import("postcss");
  const { default: selectorParser } = await import("postcss-selector-parser");
  const classNames = (css: string) => {
    const names = new Set<string>();
    postcss.parse(css).walkRules((rule) => {
      selectorParser()
        .astSync(rule.selector)
        .walkClasses((node) => {
          names.add(node.value);
        });
    });
    return names;
  };
  const libraryClasses = classNames(atomic);
  for (const name of classNames(options.css))
    if (libraryClasses.has(name))
      throw new Error(`Caller CSS redefines library class ${name}; use a separate classNamePrefix`);
  const css = initialCSS(`${atomic}\n${options.css}`, cases);
  const output = path.join(root, "web.css");
  await Bun.write(output, css);
  return {
    output,
    recipes: cases.length,
    bytes: Buffer.byteLength(css),
    gzipBytes: Bun.gzipSync(css).length,
  };
}
