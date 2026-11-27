import RefreshControlRoot from "./refresh-control.svelte";
import RefreshControlViewport from "./viewport.svelte";
import RefreshControlTrigger from "./trigger.svelte";

export { RefreshControlRoot, RefreshControlViewport, RefreshControlTrigger };
export type { RefreshControlProps } from "./refresh-control.svelte";
export type { RefreshControlTriggerProps } from "./trigger.svelte";
export const RefreshControl: typeof RefreshControlRoot & {
  Root: typeof RefreshControlRoot;
  Viewport: typeof RefreshControlViewport;
  Trigger: typeof RefreshControlTrigger;
} = Object.assign(RefreshControlRoot, {
  Root: RefreshControlRoot,
  Viewport: RefreshControlViewport,
  Trigger: RefreshControlTrigger,
});
