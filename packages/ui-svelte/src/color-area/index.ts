import ColorAreaRoot from "./color-area-root.svelte";
import ColorAreaThumb from "./color-area-thumb.svelte";
import ColorAreaCanvas from "./color-area-canvas.svelte";

export { ColorAreaRoot, ColorAreaThumb, ColorAreaCanvas };
export const ColorArea: typeof ColorAreaRoot & {
  Root: typeof ColorAreaRoot;
  Thumb: typeof ColorAreaThumb;
  Canvas: typeof ColorAreaCanvas;
} = Object.assign(ColorAreaRoot, {
  Root: ColorAreaRoot,
  Thumb: ColorAreaThumb,
  Canvas: ColorAreaCanvas,
});
