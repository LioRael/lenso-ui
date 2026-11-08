declare module "*/ts.js" {
  export const GlassRenderer: typeof import("../../packages/glass/src/shared-core/webgl").GlassRenderer;
}
declare module "*/wasm.js" {
  export const GlassRenderer: typeof import("./generated/runtime.js").GlassRenderer;
}
