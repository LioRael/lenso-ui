import { plugin } from "bun";
import { transformAsync } from "@babel/core";
import stylex from "@stylexjs/babel-plugin";

// Bun's test runtime has no Babel configuration loader. Compile the shipped
// declaration modules with the same official plugin used by applications.
plugin({
  name: "stylex-test-declarations",
  setup(build) {
    build.onLoad({ filter: /packages\/(tokens|docs)\/dist\/.*\.js$/ }, async ({ path }) => {
      const source = await Bun.file(path).text();
      if (!source.includes("@stylexjs/stylex")) return { contents: source, loader: "js" };
      const result = await transformAsync(source, {
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
      });
      return { contents: result?.code ?? source, loader: "js" };
    });
  },
});
