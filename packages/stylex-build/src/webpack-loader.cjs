const { compileStylexSource, hasStylexDeclarations } = require("./compile-source.mjs");

module.exports = function stylexDeclarationLoader(source, inputSourceMap) {
  this.cacheable?.();
  if (!hasStylexDeclarations(source)) return this.callback(null, source, inputSourceMap);
  const callback = this.async();
  const options = this.getOptions();
  compileStylexSource(source, this.resourcePath, {
    ...options,
    inputSourceMap,
    sourceMaps: this.sourceMap,
  })
    .then(async ({ code, map, imports }) => {
      // StyleX may inline/remove defineConsts imports. Retain those dependencies
      // explicitly so a constant edit invalidates the cached consumer module.
      const resolve = this.getResolve({
        dependencyType: "esm",
        conditionNames: ["source", "import", "default"],
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
      });
      for (const specifier of imports) {
        const file = await resolve(this.context, specifier);
        if (file) this.addDependency(file);
      }
      return [code, map ?? inputSourceMap];
    })
    .then(([code, map]) => callback(null, code, map), callback);
};
