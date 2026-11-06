export {
  attachGlass,
  attachContentRefraction,
  prewarmGlass,
  type GlassOptions,
  type GlassPrewarmOptions,
} from "./refraction.js";
export { paintMaterialBackdrop } from "./backdrop-paints.js";
export { createControlLens, type ControlLens, type ControlLensOptions } from "./control-lens.js";

export type {
  BackdropSnapshot,
  BackdropSnapshotOptions,
  GlassBackdropSource,
} from "./backdrop-snapshot.js";
export { prepareGlassBackdrop, type GlassBackdropScene } from "./backdrop-perimeter.js";
