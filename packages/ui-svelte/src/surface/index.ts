import SurfaceRoot from "./surface-root.svelte";

export { SurfaceRoot };
export const Surface: typeof SurfaceRoot & {
  Root: typeof SurfaceRoot;
} = Object.assign(SurfaceRoot, {
  Root: SurfaceRoot,
});
