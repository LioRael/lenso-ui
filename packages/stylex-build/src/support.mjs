import { contract } from "./metadata.mjs";

export const buildSupport = Object.freeze({
  schemaVersion: 1,
  node: Object.freeze({ range: "^26.10.0", testedVersion: "26.10.0" }),
  stylex: Object.freeze({
    compiler: contract.compiler,
    version: contract.compilerVersion,
    metadataFormat: contract.format,
    metadataVersion: contract.version,
    compileMode: contract.compileMode,
  }),
  next: Object.freeze({
    version: "16.3.8",
    router: "App Router",
    bundler: "Webpack",
    customGlobalError: "explicit-css",
    explicitCss: Object.freeze({
      api: "prepareNext",
      mode: "production",
      watch: false,
      cache: false,
    }),
    legacyAssetRewrite: Object.freeze({ customGlobalError: "unsupported", version: "16.3.8" }),
    unsupportedBundlers: Object.freeze(["Turbopack", "Rspack"]),
  }),
  vite: Object.freeze({ testedVersion: "8.3.2" }),
});
