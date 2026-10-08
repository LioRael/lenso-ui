import compiler from "@stylexjs/babel-plugin";
import { globSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { readMetadata } from "./metadata.mjs";
import { compileStylexSource, hasStylexDeclarations } from "./compile-source.mjs";

// Package and application tuples must share one processor. Concatenating
// independently compiled stylesheets changes StyleX property precedence.
export default function postcssStylex({
  include = [],
  metadata = [],
  unstable_moduleResolution,
} = {}) {
  if (
    !Array.isArray(include) ||
    include.some((file) => typeof file !== "string" || !isAbsolute(file))
  )
    throw new Error(
      "[lenso/stylex-build] PostCSS include must contain absolute application source paths/globs.",
    );
  if (!Array.isArray(metadata))
    throw new Error(
      "[lenso/stylex-build] PostCSS metadata must be an array of package raw-rule files.",
    );
  const modules = new Map();
  let pending = Promise.resolve();
  let seedSignature = "";
  async function build() {
    const seeds = metadata.map(readMetadata);
    const signature = JSON.stringify(seeds.map(({ file, rules }) => [file, rules]));
    const files = [...new Set(globSync(include).map((file) => resolve(file)))].sort();
    const current = new Map();
    let constantsChanged = signature !== seedSignature;
    for (const file of files) {
      if (file.endsWith(".d.ts")) continue;
      const stat = statSync(file);
      const stamp = `${stat.mtimeMs}:${stat.size}`;
      const previous = modules.get(file);
      if (previous?.stamp === stamp) continue;
      const source = readFileSync(file, "utf8");
      const constants = /\bdefineConsts\b/.test(source);
      if (constants || previous?.constants) constantsChanged = true;
      current.set(file, { stamp, source, constants, rules: [] });
    }
    for (const [file, record] of modules) {
      if (!files.includes(file)) {
        constantsChanged ||= record.constants;
        modules.delete(file);
      }
    }
    if (constantsChanged) {
      for (const [file, record] of modules) {
        if (!current.has(file))
          current.set(file, { ...record, source: readFileSync(file, "utf8") });
      }
    }
    for (const [file, record] of current) {
      modules.set(file, record);
      // Namespace calls and named/aliased imports all contain declaration names.
      // Props-only imports need no Babel pass; new and removed declarations are
      // still discovered because every included source is read when it changes.
      if (hasStylexDeclarations(record.source)) {
        try {
          const { rules } = await compileStylexSource(record.source, file, {
            unstable_moduleResolution,
          });
          record.rules = rules;
        } catch (error) {
          modules.delete(file); // A failed transform must be retried after correction.
          throw error;
        }
      } else record.rules = [];
    }
    seedSignature = signature;
    const rules = [
      ...seeds.flatMap(({ rules }) => rules),
      ...[...modules.values()].flatMap(({ rules }) => rules),
    ];
    return {
      css: compiler.processStylexRules(structuredClone(rules), { useLayers: false }),
      seeds,
    };
  }
  return {
    postcssPlugin: "@lenso/stylex-build/postcss",
    async Once(root, { result }) {
      let directive;
      root.walkAtRules("stylex", (rule) => {
        if (!rule.params) directive = rule;
      });
      if (!directive) return;
      // Next can compile several CSS entries concurrently. Serialize updates so
      // no processor observes an incomplete application rule collection.
      const job = pending.then(build);
      pending = job.then(
        () => undefined,
        () => undefined,
      );
      const { css, seeds } = await job;
      directive.replaceWith(css);
      for (const pattern of include) {
        const index = pattern.search(/[?*{[]/);
        if (index < 0)
          result.messages.push({
            type: "dependency",
            plugin: this.postcssPlugin,
            file: pattern,
            parent: result.opts.from,
          });
        else {
          const slash = pattern.lastIndexOf("/", index);
          result.messages.push({
            type: "dir-dependency",
            plugin: this.postcssPlugin,
            dir: pattern.slice(0, slash),
            glob: pattern.slice(slash + 1),
            parent: result.opts.from,
          });
        }
      }
      for (const { file } of seeds)
        result.messages.push({
          type: "dependency",
          plugin: this.postcssPlugin,
          file,
          parent: result.opts.from,
        });
    },
  };
}
postcssStylex.postcss = true;
