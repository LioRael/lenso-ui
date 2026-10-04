import { contract } from "./metadata.mjs";

export const buildSupport = Object.freeze({
  schemaVersion: 1,
  node: Object.freeze({ range: "^24.18.0", testedVersion: "24.18.0" }),
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
    customGlobalError: "unsupported",
    unsupportedBundlers: Object.freeze(["Turbopack", "Rspack"]),
  }),
  vite: Object.freeze({ testedVersion: "8.3.2" }),
});
