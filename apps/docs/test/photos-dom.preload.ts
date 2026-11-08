import "../../../scripts/test-dom";
import { plugin, Transpiler } from "bun";
import { transformAsync } from "@babel/core";
import stylex from "@stylexjs/babel-plugin";

// Compile application StyleX for observable DOM behavior; this does not emulate layout.
const transpiler = new Transpiler({
  loader: "tsx",
  tsconfig: {
    compilerOptions: {
      jsx: "react",
      jsxFactory: "__photosReact.createElement",
      jsxFragmentFactory: "__photosReact.Fragment",
    },
  },
});
plugin({
  name: "photos-dom-stylex",
  setup(build) {
    build.onLoad({ filter: /apps\/docs\/src\/.*\.tsx?$/ }, async ({ path }) => {
      const source = await Bun.file(path).text();
      if (!source.includes('from "@stylexjs/stylex"'))
        return { contents: source, loader: path.endsWith(".tsx") ? "tsx" : "ts" };
      const result = await transformAsync(
        'import * as __photosReact from "react";\n' + transpiler.transformSync(source),
        {
          filename: path,
          babelrc: false,
          configFile: false,
          plugins: [
            [
              stylex,
              {
                dev: false,
                runtimeInjection: false,
                unstable_moduleResolution: { type: "commonJS" },
              },
            ],
          ],
        },
      );
      return { contents: result?.code ?? source, loader: "js" };
    });
  },
});

// Happy DOM omits CSSStyleDeclaration's browser iterator.
for (const prototype of new Set([
  Object.getPrototypeOf(document.body.style),
  Object.getPrototypeOf(getComputedStyle(document.body)),
])) {
  if (!prototype[Symbol.iterator])
    Object.defineProperty(prototype, Symbol.iterator, {
      configurable: true,
      value: function* (this: CSSStyleDeclaration) {
        for (let index = 0; index < this.length; index++) yield this.item(index);
      },
    });
}
