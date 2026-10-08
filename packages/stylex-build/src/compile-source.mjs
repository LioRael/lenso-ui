import { transformAsync } from "@babel/core";
import compiler from "@stylexjs/babel-plugin";
import { compileMode, validateRules } from "./metadata.mjs";

export function hasStylexDeclarations(source) {
  return (
    source.includes("@stylexjs/stylex") &&
    /\b(create|defineVars|defineConsts|createTheme|keyframes)\b/.test(source)
  );
}

// StyleX alone transforms declarations. Next retains ownership of TypeScript,
// JSX, React refresh and server/client directives in its normal SWC pipeline.
export async function compileStylexSource(
  source,
  filename,
  { unstable_moduleResolution = { type: "commonJS" }, inputSourceMap, sourceMaps = false } = {},
) {
  const imports = [];
  const result = await transformAsync(source, {
    filename,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ["typescript", "jsx"] },
    inputSourceMap: inputSourceMap ?? false,
    sourceMaps,
    plugins: [
      [compiler, { ...compileMode, unstable_moduleResolution }],
      () => ({
        name: "lenso-stylex-constant-dependencies",
        visitor: {
          ImportDeclaration(path) {
            if (path.node.importKind !== "type" && path.node.source.value.includes(".stylex"))
              imports.push(path.node.source.value);
          },
        },
      }),
    ],
  });
  return {
    code: result.code,
    map: result.map,
    imports,
    rules: validateRules(result.metadata.stylex ?? [], filename),
  };
}
